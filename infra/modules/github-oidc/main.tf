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

  # Every env may read the shared repository (to check the digest it is about
  # to deploy); only the env that builds images may push to it.
  dynamic "statement" {
    for_each = length(var.ecr_repository_arns) > 0 ? [1] : []
    content {
      sid = "EcrRead"
      actions = [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:DescribeImages",
        "ecr:DescribeImageScanFindings",
        "ecr:GetDownloadUrlForLayer",
      ]
      resources = var.ecr_repository_arns
    }
  }

  dynamic "statement" {
    for_each = length(var.ecr_repository_arns) > 0 && var.ecr_push ? [1] : []
    content {
      sid = "EcrPush"
      actions = [
        "ecr:CompleteLayerUpload",
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

# Apply manages only what the stacks own. Each service is listed explicitly
# (no PowerUserAccess), scoped to aptiverse-* names where the ARN allows it,
# and limited to the regions the stacks use. Add a statement here when a stack
# starts managing a new service; the plan role (read only) shows what is
# missing before an apply fails.
data "aws_iam_policy_document" "apply_services" {
  count = var.create_roles ? 1 : 0

  statement {
    sid       = "Identity"
    actions   = ["sts:GetCallerIdentity"]
    resources = ["*"]
  }

  statement {
    sid = "Network"
    actions = [
      "ec2:Describe*",
      "ec2:CreateTags",
      "ec2:DeleteTags",
      "ec2:*Vpc",
      "ec2:ModifyVpcAttribute",
      "ec2:*Subnet",
      "ec2:ModifySubnetAttribute",
      "ec2:*RouteTable",
      "ec2:*Route",
      "ec2:*InternetGateway",
      "ec2:*NatGateway",
      "ec2:AllocateAddress",
      "ec2:ReleaseAddress",
      "ec2:DisassociateAddress",
      "ec2:*SecurityGroup",
      "ec2:*SecurityGroupIngress",
      "ec2:*SecurityGroupEgress",
      "ec2:*SecurityGroupRules",
      "ec2:*VpcEndpoint",
      "ec2:*VpcEndpoints",
      "ec2:*FlowLogs",
    ]
    resources = ["*"]
  }

  statement {
    sid = "ContainersAndLoadBalancing"
    actions = [
      "ecs:*",
      "elasticloadbalancing:*",
      "application-autoscaling:*",
      "acm:*",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "ImageRepositories"
    actions   = ["ecr:*"]
    resources = ["arn:${local.partition}:ecr:${local.region}:${local.account_id}:repository/aptiverse/*"]
  }

  statement {
    sid       = "ImageRepositoriesList"
    actions   = ["ecr:GetAuthorizationToken", "ecr:DescribeRepositories"]
    resources = ["*"]
  }

  statement {
    sid     = "Database"
    actions = ["rds:*"]
    resources = [
      "arn:${local.partition}:rds:${local.region}:${local.account_id}:db:aptiverse-*",
      "arn:${local.partition}:rds:${local.region}:${local.account_id}:subgrp:aptiverse-*",
      "arn:${local.partition}:rds:${local.region}:${local.account_id}:pg:aptiverse-*",
      "arn:${local.partition}:rds:${local.region}:${local.account_id}:snapshot:aptiverse-*",
    ]
  }

  statement {
    sid       = "DatabaseDescribe"
    actions   = ["rds:Describe*", "rds:ListTagsForResource"]
    resources = ["*"]
  }

  statement {
    sid       = "Buckets"
    actions   = ["s3:*"]
    resources = ["arn:${local.partition}:s3:::aptiverse-*", "arn:${local.partition}:s3:::aptiverse-*/*"]
  }

  statement {
    sid       = "BucketsList"
    actions   = ["s3:ListAllMyBuckets", "s3:GetBucketLocation"]
    resources = ["*"]
  }

  # Secret metadata only. GetSecretValue is denied in the guardrails; values are
  # set out of band. rds!* is the master secret RDS creates for
  # manage_master_user_password.
  statement {
    sid = "SecretMetadata"
    actions = [
      "secretsmanager:CreateSecret",
      "secretsmanager:DeleteSecret",
      "secretsmanager:DescribeSecret",
      "secretsmanager:UpdateSecret",
      "secretsmanager:RestoreSecret",
      "secretsmanager:TagResource",
      "secretsmanager:UntagResource",
      "secretsmanager:GetResourcePolicy",
      "secretsmanager:PutResourcePolicy",
      "secretsmanager:DeleteResourcePolicy",
      "secretsmanager:ListSecretVersionIds",
      "secretsmanager:RotateSecret",
    ]
    resources = [
      "arn:${local.partition}:secretsmanager:${local.region}:${local.account_id}:secret:aptiverse-*",
      "arn:${local.partition}:secretsmanager:${local.region}:${local.account_id}:secret:rds!*",
    ]
  }

  statement {
    sid       = "SecretList"
    actions   = ["secretsmanager:ListSecrets"]
    resources = ["*"]
  }

  statement {
    sid = "Parameters"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:PutParameter",
      "ssm:DeleteParameter",
      "ssm:AddTagsToResource",
      "ssm:RemoveTagsFromResource",
      "ssm:ListTagsForResource",
    ]
    resources = ["arn:${local.partition}:ssm:${local.region}:${local.account_id}:parameter/aptiverse/*"]
  }

  statement {
    sid       = "ParametersList"
    actions   = ["ssm:DescribeParameters"]
    resources = ["*"]
  }

  statement {
    sid = "Logs"
    actions = [
      "logs:CreateLogGroup",
      "logs:DeleteLogGroup",
      "logs:PutRetentionPolicy",
      "logs:DeleteRetentionPolicy",
      "logs:TagResource",
      "logs:UntagResource",
      "logs:TagLogGroup",
      "logs:UntagLogGroup",
      "logs:ListTagsForResource",
      "logs:ListTagsLogGroup",
      "logs:AssociateKmsKey",
      "logs:DisassociateKmsKey",
    ]
    resources = [
      "arn:${local.partition}:logs:${local.region}:${local.account_id}:log-group:/ecs/aptiverse-*",
      "arn:${local.partition}:logs:${local.region}:${local.account_id}:log-group:/vpc/aptiverse-*",
    ]
  }

  statement {
    sid       = "LogsDescribe"
    actions   = ["logs:DescribeLogGroups"]
    resources = ["*"]
  }

  statement {
    sid = "Alarms"
    actions = [
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DeleteAlarms",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:TagResource",
      "cloudwatch:UntagResource",
      "cloudwatch:ListTagsForResource",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "AlarmTopics"
    actions   = ["sns:*"]
    resources = ["arn:${local.partition}:sns:${local.region}:${local.account_id}:aptiverse-*"]
  }

  statement {
    sid       = "AlarmTopicsList"
    actions   = ["sns:ListTopics"]
    resources = ["*"]
  }

  # Key management, never use: no Encrypt, Decrypt or GenerateDataKey. Grants
  # are allowed only on behalf of AWS services (RDS, Secrets Manager).
  statement {
    sid = "KeyManagement"
    actions = [
      "kms:CreateKey",
      "kms:CreateAlias",
      "kms:DeleteAlias",
      "kms:UpdateAlias",
      "kms:DescribeKey",
      "kms:GetKeyPolicy",
      "kms:PutKeyPolicy",
      "kms:GetKeyRotationStatus",
      "kms:EnableKeyRotation",
      "kms:DisableKeyRotation",
      "kms:EnableKey",
      "kms:DisableKey",
      "kms:ScheduleKeyDeletion",
      "kms:CancelKeyDeletion",
      "kms:TagResource",
      "kms:UntagResource",
      "kms:ListAliases",
      "kms:ListKeys",
      "kms:ListResourceTags",
      "kms:ListKeyPolicies",
      "kms:ListGrants",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "KeyGrantsForServices"
    actions   = ["kms:CreateGrant", "kms:RetireGrant", "kms:RevokeGrant"]
    resources = ["*"]
    condition {
      test     = "Bool"
      variable = "kms:GrantIsForAWSResource"
      values   = ["true"]
    }
  }

  # The global stack's SES identity lives in eu-west-1.
  statement {
    sid       = "Email"
    actions   = ["ses:*"]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "apply_guard" {
  count = var.create_roles ? 1 : 0

  statement {
    sid       = "NoSecretValues"
    effect    = "Deny"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = ["*"]
  }

  # Only the regions the stacks use. Global services (IAM, STS and the like)
  # are exempt because their requests are not regional.
  statement {
    sid         = "OnlyOurRegions"
    effect      = "Deny"
    not_actions = ["iam:*", "sts:*", "cloudfront:*", "route53:*", "budgets:*", "ce:*", "support:*"]
    resources   = ["*"]
    condition {
      test     = "StringNotEquals"
      variable = "aws:RequestedRegion"
      values   = var.allowed_regions
    }
  }

  # iam:* on aptiverse-* roles could otherwise hand a role full access and pass
  # it to a task. These stacks never attach broad AWS managed policies.
  statement {
    sid       = "NoBroadManagedPolicies"
    effect    = "Deny"
    actions   = ["iam:AttachRolePolicy"]
    resources = ["*"]
    condition {
      test     = "ArnLike"
      variable = "iam:PolicyARN"
      values = [
        "arn:${local.partition}:iam::aws:policy/AdministratorAccess",
        "arn:${local.partition}:iam::aws:policy/PowerUserAccess",
        "arn:${local.partition}:iam::aws:policy/IAMFullAccess",
      ]
    }
  }

  statement {
    sid       = "NoIamUsersOrKeys"
    effect    = "Deny"
    actions   = ["iam:CreateUser", "iam:CreateAccessKey", "iam:CreateLoginProfile"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "apply_services" {
  count = var.create_roles ? 1 : 0

  name   = "scoped-services"
  role   = aws_iam_role.this["infra-apply"].id
  policy = data.aws_iam_policy_document.apply_services[0].json
}

resource "aws_iam_role_policy" "apply_guard" {
  count = var.create_roles ? 1 : 0

  name   = "guardrails"
  role   = aws_iam_role.this["infra-apply"].id
  policy = data.aws_iam_policy_document.apply_guard[0].json
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
