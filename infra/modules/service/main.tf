data "aws_region" "current" {}

locals {
  has_port = var.container_port != null
  has_lb   = var.target_group_arn != null

  # Strip an optional ":<json-key>:<version-stage>:<version-id>" suffix so IAM
  # grants access to the secret itself.
  secret_arns = distinct([
    for v in values(var.secrets) :
    regex("^(arn:[^:]+:secretsmanager:[^:]+:[^:]+:secret:[^:]+)", v)[0]
  ])

  # The migration task owns the schemas, so it gets its own secrets (the RDS
  # master login plus the runtime role it provisions) and its own roles. The
  # api and worker never see the master credentials.
  migration_secrets = coalesce(var.migration_secrets, var.secrets)
  migration_secret_arns = distinct([
    for v in values(local.migration_secrets) :
    regex("^(arn:[^:]+:secretsmanager:[^:]+:[^:]+:secret:[^:]+)", v)[0]
  ])

  environment = merge({ APP_ROLE = var.role }, var.environment)

  # The api image has no shell, so the role is chosen by the command (entrypoint is `dotnet`).
  default_commands = {
    api     = ["host/Aptiverse.Host.dll"]
    worker  = ["worker/Aptiverse.Worker.dll"]
    migrate = ["host/Aptiverse.Host.dll", "migrate"]
    ai      = ["serve"]
  }

  container_base = {
    name      = "app"
    image     = var.image
    essential = true

    environment = [for k in sort(keys(local.environment)) : { name = k, value = local.environment[k] }]
    secrets     = [for k in sort(keys(var.secrets)) : { name = k, valueFrom = var.secrets[k] }]

    readonlyRootFilesystem = var.readonly_root_filesystem
    mountPoints            = [{ sourceVolume = "tmp", containerPath = "/tmp", readOnly = false }]

    # init process reaps zombies and is recommended for ECS Exec.
    linuxParameters = { initProcessEnabled = true }

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.this.name
        awslogs-region        = data.aws_region.current.region
        awslogs-stream-prefix = var.role
      }
    }
  }

  service_container = merge(local.container_base, {
    command = coalesce(var.command, local.default_commands[var.role])
    portMappings = local.has_port ? [merge(
      { containerPort = var.container_port, protocol = "tcp" },
      try(var.service_connect.server.port_name, null) != null ? { name = var.service_connect.server.port_name, appProtocol = "http" } : {}
    )] : []
  })

  migration_environment = merge(local.environment, { APP_ROLE = "migrate" })

  migration_container = merge(local.container_base, {
    command      = coalesce(var.migration_command, local.default_commands["migrate"])
    portMappings = []
    environment  = [for k in sort(keys(local.migration_environment)) : { name = k, value = local.migration_environment[k] }]
    secrets      = [for k in sort(keys(local.migration_secrets)) : { name = k, valueFrom = local.migration_secrets[k] }]
    logConfiguration = merge(local.container_base.logConfiguration, {
      options = merge(local.container_base.logConfiguration.options, { awslogs-stream-prefix = "migrate" })
    })
  })
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${var.name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# --- IAM ---------------------------------------------------------------------

data "aws_iam_policy_document" "ecs_tasks_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# Execution role: pulls the image, writes logs, resolves secrets at task start.
resource "aws_iam_role" "execution" {
  name               = "${var.name}-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
  tags               = var.tags
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "execution_secrets" {
  count = length(local.secret_arns) > 0 ? 1 : 0

  statement {
    sid       = "ReadInjectedSecrets"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = local.secret_arns
  }
}

resource "aws_iam_role_policy" "execution_secrets" {
  count = length(local.secret_arns) > 0 ? 1 : 0

  name   = "read-injected-secrets"
  role   = aws_iam_role.execution.id
  policy = data.aws_iam_policy_document.execution_secrets[0].json
}

# Task role: what the application itself may call.
resource "aws_iam_role" "task" {
  name               = "${var.name}-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
  tags               = var.tags
}

data "aws_iam_policy_document" "ecs_exec" {
  statement {
    sid = "EcsExec"
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "ecs_exec" {
  name   = "ecs-exec"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.ecs_exec.json
}

resource "aws_iam_role_policy" "task_extra" {
  count = var.task_role_policy_json != null ? 1 : 0

  name   = "app"
  role   = aws_iam_role.task.id
  policy = var.task_role_policy_json
}

# Migration roles: the execution role may read the migration secrets; the
# task role has no permissions at all, because migrating only talks to
# Postgres. No ECS Exec into the one-off task either.
resource "aws_iam_role" "migration_execution" {
  count = var.create_migration_task ? 1 : 0

  name               = "${var.name}-migrate-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
  tags               = var.tags
}

resource "aws_iam_role_policy_attachment" "migration_execution" {
  count = var.create_migration_task ? 1 : 0

  role       = aws_iam_role.migration_execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "migration_execution_secrets" {
  count = var.create_migration_task && length(local.migration_secret_arns) > 0 ? 1 : 0

  statement {
    sid       = "ReadMigrationSecrets"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = local.migration_secret_arns
  }
}

resource "aws_iam_role_policy" "migration_execution_secrets" {
  count = var.create_migration_task && length(local.migration_secret_arns) > 0 ? 1 : 0

  name   = "read-migration-secrets"
  role   = aws_iam_role.migration_execution[0].id
  policy = data.aws_iam_policy_document.migration_execution_secrets[0].json
}

resource "aws_iam_role" "migration_task" {
  count = var.create_migration_task ? 1 : 0

  name               = "${var.name}-migrate-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
  tags               = var.tags
}

# --- Networking --------------------------------------------------------------

resource "aws_security_group" "this" {
  name        = "${var.name}-task"
  description = "Tasks of ${var.name}"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, { Name = "${var.name}-task" })
}

resource "aws_vpc_security_group_ingress_rule" "from_lb" {
  count = local.has_port && var.ingress_security_group_id != null ? 1 : 0

  security_group_id            = aws_security_group.this.id
  description                  = "Container port from the load balancer"
  referenced_security_group_id = var.ingress_security_group_id
  ip_protocol                  = "tcp"
  from_port                    = var.container_port
  to_port                      = var.container_port
}

resource "aws_vpc_security_group_ingress_rule" "from_services" {
  for_each = local.has_port ? toset(var.ingress_security_group_ids) : toset([])

  security_group_id            = aws_security_group.this.id
  description                  = "Container port from another service in the VPC"
  referenced_security_group_id = each.value
  ip_protocol                  = "tcp"
  from_port                    = var.container_port
  to_port                      = var.container_port
}

resource "aws_vpc_security_group_egress_rule" "vpc_ports" {
  for_each = toset([for p in var.egress_vpc_ports : tostring(p)])

  security_group_id = aws_security_group.this.id
  description       = "Service to service inside the VPC"
  cidr_ipv4         = data.aws_vpc.this.cidr_block
  ip_protocol       = "tcp"
  from_port         = tonumber(each.value)
  to_port           = tonumber(each.value)
}

# Outbound HTTPS is required for Anthropic, Paystack, Sentry and Grafana.
resource "aws_vpc_security_group_egress_rule" "https" {
  security_group_id = aws_security_group.this.id
  description       = "HTTPS to AWS APIs and third-party services"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "postgres" {
  security_group_id = aws_security_group.this.id
  description       = "Postgres inside the VPC"
  cidr_ipv4         = data.aws_vpc.this.cidr_block
  ip_protocol       = "tcp"
  from_port         = 5432
  to_port           = 5432
}

data "aws_vpc" "this" {
  id = var.vpc_id
}

# --- Task definitions --------------------------------------------------------

resource "aws_ecs_task_definition" "this" {
  family                   = var.name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  volume {
    name = "tmp"
  }

  container_definitions = jsonencode([
    { for k, v in local.service_container : k => v if v != null }
  ])

  tags = var.tags
}

resource "aws_ecs_task_definition" "migration" {
  count = var.create_migration_task ? 1 : 0

  family                   = "${var.name}-migrate"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.migration_execution[0].arn
  task_role_arn            = aws_iam_role.migration_task[0].arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  volume {
    name = "tmp"
  }

  container_definitions = jsonencode([
    { for k, v in local.migration_container : k => v if v != null }
  ])

  tags = var.tags
}

# --- Service -----------------------------------------------------------------

resource "aws_ecs_service" "this" {
  name             = var.name
  cluster          = var.cluster_arn
  task_definition  = aws_ecs_task_definition.this.arn
  desired_count    = var.desired_count
  launch_type      = "FARGATE"
  platform_version = "LATEST"

  enable_execute_command  = true
  propagate_tags          = "SERVICE"
  enable_ecs_managed_tags = true

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  health_check_grace_period_seconds = local.has_lb ? var.health_check_grace_period_seconds : null

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.this.id]
    assign_public_ip = var.assign_public_ip
  }

  dynamic "service_connect_configuration" {
    for_each = var.service_connect == null ? [] : [var.service_connect]
    content {
      enabled   = true
      namespace = service_connect_configuration.value.namespace

      dynamic "service" {
        for_each = service_connect_configuration.value.server == null ? [] : [service_connect_configuration.value.server]
        content {
          port_name      = service.value.port_name
          discovery_name = service.value.discovery_name
          client_alias {
            port     = var.container_port
            dns_name = service.value.discovery_name
          }
        }
      }
    }
  }

  dynamic "load_balancer" {
    for_each = local.has_lb ? [1] : []
    content {
      target_group_arn = var.target_group_arn
      container_name   = "app"
      container_port   = var.container_port
    }
  }

  tags = var.tags

  lifecycle {
    # Autoscaling owns the running count after the first apply.
    ignore_changes = [desired_count]
  }
}

# --- Autoscaling -------------------------------------------------------------

resource "aws_appautoscaling_target" "this" {
  service_namespace  = "ecs"
  scalable_dimension = "ecs:service:DesiredCount"
  resource_id        = "service/${var.cluster_name}/${aws_ecs_service.this.name}"
  min_capacity       = var.min_capacity
  max_capacity       = var.max_capacity
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "${var.name}-cpu"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.this.service_namespace
  scalable_dimension = aws_appautoscaling_target.this.scalable_dimension
  resource_id        = aws_appautoscaling_target.this.resource_id

  target_tracking_scaling_policy_configuration {
    target_value       = var.cpu_target
    scale_in_cooldown  = 300
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "memory" {
  name               = "${var.name}-memory"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.this.service_namespace
  scalable_dimension = aws_appautoscaling_target.this.scalable_dimension
  resource_id        = aws_appautoscaling_target.this.resource_id

  target_tracking_scaling_policy_configuration {
    target_value       = var.memory_target
    scale_in_cooldown  = 300
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
  }
}
