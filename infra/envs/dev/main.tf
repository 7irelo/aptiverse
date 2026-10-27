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
  image = "${local.global.api_repository_url}:${aws_ssm_parameter.image_tag.insecure_value}"

  db_secret = module.database.master_user_secret_arn

  # Plain configuration shared by the api, worker and migration task. Names
  # follow the api's configuration keys (section__key); the api composes its
  # connection string from the Database__* values.
  app_environment = merge({
    ASPNETCORE_ENVIRONMENT             = var.aspnetcore_environment
    ASPNETCORE_HTTP_PORTS              = tostring(var.api_container_port)
    Database__Host                     = module.database.address
    Database__Port                     = tostring(module.database.port)
    Database__Name                     = module.database.db_name
    Auth__Issuer                       = "https://${local.api_fqdn}"
    Auth__WebAppUrl                    = var.web_origins[0]
    ForwardedHeaders__KnownNetworks__0 = var.vpc_cidr
    Storage__Bucket                    = module.storage.bucket_name
    Storage__Region                    = var.region
    Email__SesRegion                   = local.global.ses_region
    Email__ConfigurationSet            = local.global.ses_configuration_set_name
    Email__FromAddress                 = "noreply@${var.domain}"
    OTEL_RESOURCE_ATTRIBUTES           = "deployment.environment=${var.environment}"
    Sentry__Environment                = var.environment
  }, { for i, origin in var.web_origins : "Cors__AllowedOrigins__${i}" => origin })

  # Secrets resolved by ECS at task start. Every referenced secret (and JSON
  # key) must have a value before the first deploy. Add Paystack, Anthropic and
  # the rest here as their modules land in the api.
  #
  # The api and worker log in as the runtime role in the db-app secret, which
  # can change rows but not the schema. Only the migration task gets the RDS
  # master login; it creates the runtime role and grants it access.
  app_secrets = {
    Database__Username          = "${module.secrets.arns["db-app"]}:username::"
    Database__Password          = "${module.secrets.arns["db-app"]}:password::"
    Auth__SigningKey            = module.secrets.arns["jwt-signing-key"]
    Sentry__Dsn                 = module.secrets.arns["sentry-dsn"]
    OTEL_EXPORTER_OTLP_HEADERS  = "${module.secrets.arns["grafana-otlp"]}:otlp_headers::"
    OTEL_EXPORTER_OTLP_ENDPOINT = "${module.secrets.arns["grafana-otlp"]}:endpoint::"
  }

  migration_secrets = merge(local.app_secrets, {
    Database__Username          = "${local.db_secret}:username::"
    Database__Password          = "${local.db_secret}:password::"
    Database__Runtime__Username = "${module.secrets.arns["db-app"]}:username::"
    Database__Runtime__Password = "${module.secrets.arns["db-app"]}:password::"
  })

  # --- ai service (ADR 0007) ---
  ai_image = "${local.global.ai_repository_url}:${aws_ssm_parameter.ai_image_tag.insecure_value}"

  # The ai service is internal only: no load balancer, reachable from the api and worker through Service
  # Connect. It verifies service tokens against the api's JWKS over the same private path.
  ai_environment = {
    AI__ENVIRONMENT                      = var.environment == "prod" ? "production" : (var.environment == "staging" ? "staging" : "development")
    AI__AUTH__JWKS_URL                   = "http://api:${var.api_container_port}/.well-known/jwks.json"
    AI__AUTH__ISSUER                     = "https://${local.api_fqdn}"
    AI__DATABASE__HOST                   = module.database.address
    AI__DATABASE__PORT                   = tostring(module.database.port)
    AI__DATABASE__NAME                   = module.database.db_name
    AI__GATEWAY__PROVIDERS               = jsonencode(var.ai_providers)
    AI__GATEWAY__DAILY_SPEND_CEILING_USD = tostring(var.ai_daily_spend_ceiling_usd)
    AI__EMBEDDINGS__PROVIDER             = var.ai_embedding_provider
    AI__EMBEDDINGS__MODEL                = var.ai_embedding_model
    AI__EMBEDDINGS__DIMENSIONS           = tostring(var.ai_embedding_dimensions)
    AI__RESULTS_QUEUE_URL                = aws_sqs_queue.ai_results.url
    AI__APTIVERSE_MCP_URL                = "http://api:${var.api_container_port}/mcp"
    AI__TELEMETRY__CAPTURE_CONTENT       = "false"
    OTEL_RESOURCE_ATTRIBUTES             = "deployment.environment=${var.environment}"
  }

  ai_secrets = {
    AI__DATABASE__USERNAME         = "${module.secrets.arns["ai-db"]}:username::"
    AI__DATABASE__PASSWORD         = "${module.secrets.arns["ai-db"]}:password::"
    AI__GATEWAY__ANTHROPIC_API_KEY = "${module.secrets.arns["anthropic"]}:api_key::"
    AI__GATEWAY__OPENAI_API_KEY    = "${module.secrets.arns["openai"]}:api_key::"
    AI__EMBEDDINGS__OPENAI_API_KEY = "${module.secrets.arns["openai"]}:api_key::"
    AI__TELEMETRY__OTLP_ENDPOINT   = "${module.secrets.arns["grafana-otlp"]}:endpoint::"
  }

  # Only the ai migration task sees the RDS master login: it creates the vector extension, the rag and
  # graph schemas and the ai runtime role (from the ai-db secret), then grants that role DML only.
  ai_migration_secrets = merge(local.ai_secrets, {
    AI__DATABASE__USERNAME         = "${local.db_secret}:username::"
    AI__DATABASE__PASSWORD         = "${local.db_secret}:password::"
    AI__DATABASE__RUNTIME_USERNAME = "${module.secrets.arns["ai-db"]}:username::"
    AI__DATABASE__RUNTIME_PASSWORD = "${module.secrets.arns["ai-db"]}:password::"
  })

  ses_resources = [
    local.global.ses_identity_arn,
    local.global.ses_configuration_set_arn,
  ]
}

# --- Foundation --------------------------------------------------------------

module "network" {
  source = "../../modules/network"

  name                = local.name
  cidr_block          = var.vpc_cidr
  enable_nat_gateway  = var.enable_nat_gateway
  interface_endpoints = var.interface_endpoints
}

# The api image repository moved to envs/global so one image is promoted by
# digest. A per-environment repository that was already applied is dropped from
# state, not destroyed; delete it by hand once it holds nothing worth keeping.
removed {
  from = module.ecr

  lifecycle {
    destroy = false
  }
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

resource "aws_ssm_parameter" "ai_image_tag" {
  name           = "/aptiverse/${var.environment}/ai/image-tag"
  description    = "ai service image tag (git sha) currently deployed. Written by the ai deploy pipeline."
  type           = "String"
  insecure_value = var.initial_image_tag

  lifecycle {
    ignore_changes = [insecure_value]
  }
}

resource "aws_service_discovery_http_namespace" "this" {
  name        = "${local.name}.internal"
  description = "Service Connect namespace for private service to service calls"
}

# Results of long ai runs for the .NET Worker. Encrypted at rest; a message that fails five times moves to
# the dead letter queue instead of being lost.
resource "aws_sqs_queue" "ai_results_dlq" {
  name                      = "${local.name}-ai-results-dlq"
  message_retention_seconds = 1209600
  sqs_managed_sse_enabled   = true
}

resource "aws_sqs_queue" "ai_results" {
  name                       = "${local.name}-ai-results"
  visibility_timeout_seconds = 120
  message_retention_seconds  = 345600
  sqs_managed_sse_enabled    = true
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.ai_results_dlq.arn
    maxReceiveCount     = 5
  })
}

data "aws_iam_policy_document" "ai_results_tls" {
  statement {
    sid       = "DenyInsecureTransport"
    effect    = "Deny"
    actions   = ["sqs:*"]
    resources = [aws_sqs_queue.ai_results.arn]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_sqs_queue_policy" "ai_results" {
  queue_url = aws_sqs_queue.ai_results.url
  policy    = data.aws_iam_policy_document.ai_results_tls.json
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

# Task role policies, one per role. The api signs presigned upload and
# download URLs and removes a user's own uploads; the worker writes exports and
# runs purge jobs. Neither may touch any other prefix. The migration task role
# has no policy at all (modules/service).
data "aws_iam_policy_document" "api" {
  statement {
    sid       = "UploadsAndExports"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:AbortMultipartUpload"]
    resources = ["${module.storage.bucket_arn}/uploads/*", "${module.storage.bucket_arn}/exports/*"]
  }

  statement {
    sid       = "DeleteOwnUploads"
    actions   = ["s3:DeleteObject"]
    resources = ["${module.storage.bucket_arn}/uploads/*"]
  }

  statement {
    sid       = "SendEmail"
    actions   = ["ses:SendEmail"]
    resources = local.ses_resources
  }
}

data "aws_iam_policy_document" "worker" {
  statement {
    sid       = "ReadAndPurge"
    actions   = ["s3:GetObject", "s3:DeleteObject"]
    resources = ["${module.storage.bucket_arn}/uploads/*", "${module.storage.bucket_arn}/exports/*"]
  }

  statement {
    sid       = "WriteExports"
    actions   = ["s3:PutObject", "s3:AbortMultipartUpload"]
    resources = ["${module.storage.bucket_arn}/exports/*"]
  }

  statement {
    sid       = "ListForPurge"
    actions   = ["s3:ListBucket"]
    resources = [module.storage.bucket_arn]
    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values   = ["uploads/*", "exports/*"]
    }
  }

  statement {
    sid       = "SendEmail"
    actions   = ["ses:SendEmail"]
    resources = local.ses_resources
  }

  statement {
    sid       = "ConsumeAiResults"
    actions   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:ChangeMessageVisibility", "sqs:GetQueueAttributes"]
    resources = [aws_sqs_queue.ai_results.arn]
  }
}

# The ai task may publish results and nothing else in AWS: no S3, no Secrets Manager at runtime, and no
# Bedrock unless the fallback is switched on after the residency review (ai_bedrock_model_arns).
data "aws_iam_policy_document" "ai" {
  statement {
    sid       = "PublishResults"
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.ai_results.arn]
  }

  dynamic "statement" {
    for_each = length(var.ai_bedrock_model_arns) > 0 ? [1] : []
    content {
      sid       = "BedrockFallback"
      actions   = ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"]
      resources = var.ai_bedrock_model_arns
    }
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
  task_role_policy_json = data.aws_iam_policy_document.api.json

  create_migration_task = true
  migration_secrets     = local.migration_secrets

  egress_vpc_ports = [var.ai_container_port]
  service_connect = {
    namespace = aws_service_discovery_http_namespace.this.arn
    server    = { port_name = "http", discovery_name = "api" }
  }
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
  task_role_policy_json = data.aws_iam_policy_document.worker.json

  egress_vpc_ports = [var.ai_container_port]
  service_connect  = { namespace = aws_service_discovery_http_namespace.this.arn }
}

module "ai" {
  source = "../../modules/service"

  name         = "${local.name}-ai"
  role         = "ai"
  cluster_arn  = aws_ecs_cluster.this.arn
  cluster_name = aws_ecs_cluster.this.name
  image        = local.ai_image
  cpu          = var.ai_cpu
  memory       = var.ai_memory

  container_port             = var.ai_container_port
  ingress_security_group_ids = [module.api.security_group_id, module.worker.security_group_id]
  egress_vpc_ports           = [var.api_container_port]

  vpc_id           = module.network.vpc_id
  subnet_ids       = local.task_subnet_ids
  assign_public_ip = local.assign_public_ip

  environment = merge(local.ai_environment, { OTEL_SERVICE_NAME = "aptiverse-ai" })
  secrets     = local.ai_secrets

  desired_count = var.ai_desired_count
  min_capacity  = var.ai_desired_count
  max_capacity  = var.ai_max_count

  log_retention_days    = var.log_retention_days
  task_role_policy_json = data.aws_iam_policy_document.ai.json

  create_migration_task = true
  migration_secrets     = local.ai_migration_secrets
  migration_command     = ["migrate"]

  service_connect = {
    namespace = aws_service_discovery_http_namespace.this.arn
    server    = { port_name = "http", discovery_name = "ai" }
  }
}


# --- CI access and alerting ---------------------------------------------------

module "github_oidc" {
  source = "../../modules/github-oidc"

  environment               = var.environment
  name_prefix               = local.name
  allow_main_branch_deploys = var.allow_main_branch_deploys
  state_bucket_name         = var.state_bucket_name

  ecr_repository_arns              = [local.global.api_repository_arn, local.global.ai_repository_arn]
  ecr_push                         = var.ecr_push
  ecs_cluster_arn                  = aws_ecs_cluster.this.arn
  ecs_service_arns                 = [module.api.service_arn, module.worker.service_arn]
  migration_task_definition_family = module.api.migration_task_definition_family
  image_tag_parameter_arn          = aws_ssm_parameter.image_tag.arn
  log_group_arns                   = [module.api.log_group_arn, module.worker.log_group_arn]

  passable_role_arns = [
    module.api.task_role_arn,
    module.api.execution_role_arn,
    module.api.migration_task_role_arn,
    module.api.migration_execution_role_arn,
    module.worker.task_role_arn,
    module.worker.execution_role_arn,
    module.ai.task_role_arn,
    module.ai.execution_role_arn,
    module.ai.migration_task_role_arn,
    module.ai.migration_execution_role_arn,
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
