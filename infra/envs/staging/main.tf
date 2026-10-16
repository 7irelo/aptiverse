# Environment stack. This file is identical in envs/dev, envs/staging and
# envs/prod (CI checks it); per-environment differences live in the variable
# defaults in variables.tf and in an optional terraform.tfvars.

data "aws_caller_identity" "current" {}

data "terraform_remote_state" "global" {
  backend = "s3"
  config = {
    bucket = var.state_bucket_name
    key    = "v2/global/terraform.tfstate"
    region = var.region
  }
}

locals {
  name       = "aptiverse-${var.environment}"
  account_id = data.aws_caller_identity.current.account_id
  global     = data.terraform_remote_state.global.outputs

  api_fqdn = "${var.api_hostname}.${var.domain}"

  # Tasks need outbound internet (Anthropic, Paystack, Sentry). With NAT they
  # run in private subnets; without it (dev) they run in public subnets with a
  # public IP and a security group that only admits the ALB.
  task_subnet_ids  = var.enable_nat_gateway ? module.network.private_subnet_ids : module.network.public_subnet_ids
  assign_public_ip = !var.enable_nat_gateway

  # The deployed tag lives in SSM so the api pipeline can roll out a new image
  # without editing this repo, while the task definition stays defined here.
  image = "${module.ecr.repository_urls["api"]}:${aws_ssm_parameter.image_tag.insecure_value}"

  db_secret = module.database.master_user_secret_arn

  # Plain configuration shared by the api, worker and migration task.
  app_environment = {
    ASPNETCORE_ENVIRONMENT   = var.aspnetcore_environment
    ASPNETCORE_HTTP_PORTS    = tostring(var.api_container_port)
    Database__Host           = module.database.address
    Database__Port           = tostring(module.database.port)
    Database__Name           = module.database.db_name
    Storage__Bucket          = module.storage.bucket_name
    Storage__Region          = var.region
    Email__SesRegion         = local.global.ses_region
    Email__ConfigurationSet  = local.global.ses_configuration_set_name
    Email__FromAddress       = "noreply@${var.domain}"
    App__ApiBaseUrl          = "https://${local.api_fqdn}"
    App__WebOrigins          = join(",", var.web_origins)
    OTEL_RESOURCE_ATTRIBUTES = "deployment.environment=${var.environment}"
    Sentry__Environment      = var.environment
  }

  # Secrets resolved by ECS at task start. Every referenced secret (and JSON
  # key) must have a value before the first deploy. Add Paystack, Anthropic and
  # the rest here as their modules land in the api.
  app_secrets = {
    Database__Username          = "${local.db_secret}:username::"
    Database__Password          = "${local.db_secret}:password::"
    Jwt__SigningKey             = module.secrets.arns["jwt-signing-key"]
    Sentry__Dsn                 = module.secrets.arns["sentry-dsn"]
    OTEL_EXPORTER_OTLP_HEADERS  = "${module.secrets.arns["grafana-otlp"]}:otlp_headers::"
    OTEL_EXPORTER_OTLP_ENDPOINT = "${module.secrets.arns["grafana-otlp"]}:endpoint::"
  }
}

# --- Foundation --------------------------------------------------------------

module "network" {
  source = "../../modules/network"

  name                = local.name
  cidr_block          = var.vpc_cidr
  enable_nat_gateway  = var.enable_nat_gateway
  interface_endpoints = var.interface_endpoints
}

module "ecr" {
  source = "../../modules/ecr"

  name_prefix  = local.name
  repositories = ["api"]
}

module "secrets" {
  source = "../../modules/secrets"

  name_prefix = "aptiverse/${var.environment}"
}

module "storage" {
  source = "../../modules/storage"

  bucket_name          = "${local.name}-uploads-${local.account_id}"
  cors_allowed_origins = var.web_origins
}

module "database" {
  source = "../../modules/database"

  name                    = local.name
  vpc_id                  = module.network.vpc_id
  subnet_ids              = module.network.private_subnet_ids
  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  max_allocated_storage   = var.db_max_allocated_storage
  multi_az                = var.db_multi_az
  backup_retention_period = var.db_backup_retention_days

  allowed_security_group_ids = [
    module.api.security_group_id,
    module.worker.security_group_id,
  ]
}

# --- Edge --------------------------------------------------------------------

module "alb" {
  source = "../../modules/alb"

  name                                = local.name
  vpc_id                              = module.network.vpc_id
  subnet_ids                          = module.network.public_subnet_ids
  domain_name                         = local.api_fqdn
  certificate_validation_record_fqdns = values(module.acm_dns.fqdns)
  target_port                         = var.api_container_port
  deletion_protection                 = var.alb_deletion_protection
}

# ACM validation records first, so the certificate can validate before the
# HTTPS listener is created.
module "acm_dns" {
  source = "../../modules/dns"

  zone_name = var.domain
  records = {
    for domain, r in module.alb.certificate_validation_records :
    "acm-${domain}" => {
      name    = r.name
      type    = r.type
      content = r.content
      proxied = false
      comment = "ACM validation for ${domain}"
    }
  }
}

module "api_dns" {
  source = "../../modules/dns"

  zone_name = var.domain
  records = {
    api = {
      name    = local.api_fqdn
      type    = "CNAME"
      content = module.alb.dns_name
      proxied = true
    }
  }
}

# --- Compute -----------------------------------------------------------------

resource "aws_ecs_cluster" "this" {
  name = local.name

  setting {
    name  = "containerInsights"
    value = var.container_insights
  }
}

resource "aws_ssm_parameter" "image_tag" {
  name           = "/aptiverse/${var.environment}/api/image-tag"
  description    = "Image tag (git sha) currently deployed. Written by the api deploy pipeline."
  type           = "String"
  insecure_value = var.initial_image_tag

  lifecycle {
    ignore_changes = [insecure_value]
  }
}

data "aws_iam_policy_document" "app" {
  statement {
    sid = "Uploads"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:AbortMultipartUpload",
    ]
    resources = ["${module.storage.bucket_arn}/*"]
  }

  statement {
    sid       = "UploadsList"
    actions   = ["s3:ListBucket"]
    resources = [module.storage.bucket_arn]
  }

  statement {
    sid     = "SendEmail"
    actions = ["ses:SendEmail"]
    resources = [
      local.global.ses_identity_arn,
      local.global.ses_configuration_set_arn,
    ]
  }
}

module "api" {
  source = "../../modules/service"

  name         = "${local.name}-api"
  role         = "api"
  cluster_arn  = aws_ecs_cluster.this.arn
  cluster_name = aws_ecs_cluster.this.name
  image        = local.image
  cpu          = var.api_cpu
  memory       = var.api_memory

  container_port            = var.api_container_port
  target_group_arn          = module.alb.target_group_arn
  ingress_security_group_id = module.alb.security_group_id

  vpc_id           = module.network.vpc_id
  subnet_ids       = local.task_subnet_ids
  assign_public_ip = local.assign_public_ip

  environment = merge(local.app_environment, { OTEL_SERVICE_NAME = "aptiverse-api" })
  secrets     = local.app_secrets

  desired_count = var.api_desired_count
  min_capacity  = var.api_min_count
  max_capacity  = var.api_max_count

  log_retention_days    = var.log_retention_days
  task_role_policy_json = data.aws_iam_policy_document.app.json

  create_migration_task = true
}

module "worker" {
  source = "../../modules/service"

  name         = "${local.name}-worker"
  role         = "worker"
  cluster_arn  = aws_ecs_cluster.this.arn
  cluster_name = aws_ecs_cluster.this.name
  image        = local.image
  cpu          = var.worker_cpu
  memory       = var.worker_memory

  vpc_id           = module.network.vpc_id
  subnet_ids       = local.task_subnet_ids
  assign_public_ip = local.assign_public_ip

  environment = merge(local.app_environment, { OTEL_SERVICE_NAME = "aptiverse-worker" })
  secrets     = local.app_secrets

  desired_count = var.worker_desired_count
  min_capacity  = var.worker_desired_count
  max_capacity  = var.worker_max_count

  log_retention_days    = var.log_retention_days
  task_role_policy_json = data.aws_iam_policy_document.app.json
}

# --- CI access and alerting ---------------------------------------------------

module "github_oidc" {
  source = "../../modules/github-oidc"

  environment               = var.environment
  name_prefix               = local.name
  allow_main_branch_deploys = var.allow_main_branch_deploys
  state_bucket_name         = var.state_bucket_name

  ecr_repository_arns              = values(module.ecr.repository_arns)
  ecs_cluster_arn                  = aws_ecs_cluster.this.arn
  ecs_service_arns                 = [module.api.service_arn, module.worker.service_arn]
  migration_task_definition_family = module.api.migration_task_definition_family
  image_tag_parameter_arn          = aws_ssm_parameter.image_tag.arn
  log_group_arns                   = [module.api.log_group_arn, module.worker.log_group_arn]

  passable_role_arns = [
    module.api.task_role_arn,
    module.api.execution_role_arn,
  ]
}

module "monitoring" {
  source = "../../modules/monitoring"

  name                    = local.name
  alarm_emails            = var.alarm_emails
  alb_arn_suffix          = module.alb.arn_suffix
  target_group_arn_suffix = module.alb.target_group_arn_suffix
  db_instance_identifier  = module.database.instance_identifier
  ecs_cluster_name        = aws_ecs_cluster.this.name
  ecs_service_names       = [module.api.service_name, module.worker.service_name]
}
