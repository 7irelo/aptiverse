data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}
data "aws_region" "current" {}

locals {
  oidc_url     = "https://token.actions.githubusercontent.com"
  provider_arn = var.create_provider ? aws_iam_openid_connect_provider.github[0].arn : data.aws_iam_openid_connect_provider.github[0].arn
  account_id   = data.aws_caller_identity.current.account_id
  partition    = data.aws_partition.current.partition
  region       = data.aws_region.current.region

  env_subject  = { for repo in ["api", "web", "infra"] : repo => "repo:${var.github_org}/${repo}:environment:${coalesce(var.environment, "none")}" }
  main_subject = { for repo in ["api", "web", "infra"] : repo => "repo:${var.github_org}/${repo}:ref:refs/heads/main" }

  deploy_subjects = {
    for repo in ["api", "web"] : repo => concat(
      [local.env_subject[repo]],
      var.allow_main_branch_deploys ? [local.main_subject[repo]] : [],
    )
  }
}

resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_provider ? 1 : 0

  url            = local.oidc_url
  client_id_list = ["sts.amazonaws.com"]
  tags           = var.tags
}

data "aws_iam_openid_connect_provider" "github" {
  count = var.create_provider ? 0 : 1

  url = local.oidc_url
}

# --- Trust policies ----------------------------------------------------------

data "aws_iam_policy_document" "trust" {
  for_each = var.create_roles ? {
    api         = local.deploy_subjects.api
    web         = local.deploy_subjects.web
    infra-plan  = ["repo:${var.github_org}/infra:pull_request", local.main_subject.infra]
    infra-apply = [local.env_subject.infra]
  } : {}

  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [local.provider_arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = each.value
    }
  }
}

resource "aws_iam_role" "this" {
  for_each = data.aws_iam_policy_document.trust

  name                 = "${var.name_prefix}-gha-${each.key}"
  description          = "GitHub Actions (${each.key}) for ${var.environment}"
  assume_role_policy   = each.value.json
  max_session_duration = 3600
  tags                 = var.tags
}

# --- api: push images, run the migration task, roll the services ------------

data "aws_iam_policy_document" "api" {
  count = var.create_roles ? 1 : 0

  statement {
    sid       = "EcrLogin"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  dynamic "statement" {
    for_each = length(var.ecr_repository_arns) > 0 ? [1] : []
    content {
      sid = "EcrPush"
      actions = [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeImages",
        "ecr:DescribeImageScanFindings",
        "ecr:GetDownloadUrlForLayer",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart",
      ]
      resources = var.ecr_repository_arns
    }
  }

  dynamic "statement" {
    for_each = length(var.ecs_service_arns) > 0 ? [1] : []
    content {
      sid       = "EcsRollService"
      actions   = ["ecs:UpdateService", "ecs:DescribeServices"]
      resources = var.ecs_service_arns
    }
  }

  dynamic "statement" {
    for_each = var.migration_task_definition_family != null && var.ecs_cluster_arn != null ? [1] : []
    content {
      sid       = "EcsRunMigration"
      actions   = ["ecs:RunTask"]
      resources = ["arn:${local.partition}:ecs:${local.region}:${local.account_id}:task-definition/${var.migration_task_definition_family}:*"]
      condition {
        test     = "ArnEquals"
        variable = "ecs:cluster"
        values   = [var.ecs_cluster_arn]
      }
    }
  }

  dynamic "statement" {
    for_each = var.ecs_cluster_arn != null ? [1] : []
    content {
      sid       = "EcsWatchTasks"
      actions   = ["ecs:DescribeTasks", "ecs:StopTask"]
      resources = ["arn:${local.partition}:ecs:${local.region}:${local.account_id}:task/${element(split("/", var.ecs_cluster_arn), 1)}/*"]
    }
  }

  statement {
    sid       = "EcsDescribe"
    actions   = ["ecs:DescribeTaskDefinition", "ecs:ListTasks"]
    resources = ["*"]
  }

  dynamic "statement" {
    for_each = length(var.passable_role_arns) > 0 ? [1] : []
    content {
      sid       = "PassTaskRoles"
      actions   = ["iam:PassRole"]
      resources = var.passable_role_arns
      condition {
        test     = "StringEquals"
        variable = "iam:PassedToService"
        values   = ["ecs-tasks.amazonaws.com"]
      }
    }
  }

  dynamic "statement" {
    for_each = var.image_tag_parameter_arn != null ? [1] : []
    content {
      sid       = "RecordImageTag"
      actions   = ["ssm:GetParameter", "ssm:PutParameter"]
      resources = [var.image_tag_parameter_arn]
    }
  }

  dynamic "statement" {
    for_each = length(var.log_group_arns) > 0 ? [1] : []
    content {
      sid       = "ReadDeployLogs"
      actions   = ["logs:GetLogEvents", "logs:FilterLogEvents"]
      resources = [for a in var.log_group_arns : "${a}:*"]
    }
  }
}

resource "aws_iam_role_policy" "api" {
  count = var.create_roles ? 1 : 0

  name   = "deploy"
  role   = aws_iam_role.this["api"].id
  policy = data.aws_iam_policy_document.api[0].json
}

# --- web: nothing by default (Vercel hosts it) ------------------------------

resource "aws_iam_role_policy" "web" {
  count = var.create_roles && var.web_policy_json != null ? 1 : 0

  name   = "web"
  role   = aws_iam_role.this["web"].id
  policy = var.web_policy_json
}

# --- infra: plan (read only) and apply --------------------------------------

data "aws_iam_policy_document" "state" {
  count = var.create_roles ? 1 : 0

  statement {
    sid       = "StateList"
    actions   = ["s3:ListBucket"]
    resources = ["arn:${local.partition}:s3:::${var.state_bucket_name}"]
  }

  statement {
    sid       = "StateReadWriteAndLock"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["arn:${local.partition}:s3:::${var.state_bucket_name}/v2/*"]
  }
}

data "aws_iam_policy_document" "plan_guard" {
  count = var.create_roles ? 1 : 0

  statement {
    sid       = "NoSecretValues"
    effect    = "Deny"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy_attachment" "plan_readonly" {
  count = var.create_roles ? 1 : 0

  role       = aws_iam_role.this["infra-plan"].name
  policy_arn = "arn:${local.partition}:iam::aws:policy/ReadOnlyAccess"
}

resource "aws_iam_role_policy" "plan_state" {
  count = var.create_roles ? 1 : 0

  name   = "terraform-state"
  role   = aws_iam_role.this["infra-plan"].id
  policy = data.aws_iam_policy_document.state[0].json
}

resource "aws_iam_role_policy" "plan_guard" {
  count = var.create_roles ? 1 : 0

  name   = "no-secret-values"
  role   = aws_iam_role.this["infra-plan"].id
  policy = data.aws_iam_policy_document.plan_guard[0].json
}

# Apply needs to manage almost everything the stacks own. PowerUserAccess covers
# all non-IAM services; IAM is limited to aptiverse-* roles and policies and the
# GitHub OIDC provider.
resource "aws_iam_role_policy_attachment" "apply_poweruser" {
  count = var.create_roles ? 1 : 0

  role       = aws_iam_role.this["infra-apply"].name
  policy_arn = "arn:${local.partition}:iam::aws:policy/PowerUserAccess"
}

data "aws_iam_policy_document" "apply_iam" {
  count = var.create_roles ? 1 : 0

  statement {
    sid     = "ManageOwnIam"
    actions = ["iam:*"]
    resources = [
      "arn:${local.partition}:iam::${local.account_id}:role/aptiverse-*",
      "arn:${local.partition}:iam::${local.account_id}:policy/aptiverse-*",
      "arn:${local.partition}:iam::${local.account_id}:oidc-provider/token.actions.githubusercontent.com",
    ]
  }

  statement {
    sid       = "ReadIam"
    actions   = ["iam:Get*", "iam:List*"]
    resources = ["*"]
  }

  statement {
    sid       = "ServiceLinkedRoles"
    actions   = ["iam:CreateServiceLinkedRole"]
    resources = ["arn:${local.partition}:iam::${local.account_id}:role/aws-service-role/*"]
  }
}

resource "aws_iam_role_policy" "apply_iam" {
  count = var.create_roles ? 1 : 0

  name   = "scoped-iam"
  role   = aws_iam_role.this["infra-apply"].id
  policy = data.aws_iam_policy_document.apply_iam[0].json
}

resource "aws_iam_role_policy" "apply_state" {
  count = var.create_roles ? 1 : 0

  name   = "terraform-state"
  role   = aws_iam_role.this["infra-apply"].id
  policy = data.aws_iam_policy_document.state[0].json
}
