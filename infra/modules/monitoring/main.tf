data "aws_caller_identity" "current" {}

# CloudWatch cannot publish to a topic encrypted with the AWS managed SNS key,
# so the topic gets its own small CMK that allows CloudWatch to use it.
data "aws_iam_policy_document" "kms" {
  statement {
    sid       = "AccountAdmin"
    actions   = ["kms:*"]
    resources = ["*"]
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
  }

  statement {
    sid       = "CloudWatchPublish"
    actions   = ["kms:Decrypt", "kms:GenerateDataKey*"]
    resources = ["*"]
    principals {
      type        = "Service"
      identifiers = ["cloudwatch.amazonaws.com"]
    }
  }
}

resource "aws_kms_key" "alarms" {
  description             = "${var.name} alarm topic encryption"
  enable_key_rotation     = true
  deletion_window_in_days = 7
  policy                  = data.aws_iam_policy_document.kms.json
  tags                    = var.tags
}

resource "aws_kms_alias" "alarms" {
  name          = "alias/${var.name}-alarms"
  target_key_id = aws_kms_key.alarms.key_id
}

resource "aws_sns_topic" "alarms" {
  name              = "${var.name}-alarms"
  kms_master_key_id = aws_kms_key.alarms.arn
  tags              = var.tags
}

resource "aws_sns_topic_subscription" "email" {
  for_each = toset(var.alarm_emails)

  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = each.value
}

locals {
  actions = [aws_sns_topic.alarms.arn]
}

# --- ALB ---------------------------------------------------------------------

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  count = var.alb_arn_suffix != null ? 1 : 0

  alarm_name          = "${var.name}-alb-5xx"
  alarm_description   = "ALB and target 5xx responses above ${var.alb_5xx_threshold} in 5 minutes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = var.alb_5xx_threshold
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.actions
  ok_actions          = local.actions

  metric_query {
    id          = "total"
    expression  = "FILL(elb, 0) + FILL(target, 0)"
    label       = "5xx total"
    return_data = true
  }

  metric_query {
    id = "elb"
    metric {
      namespace   = "AWS/ApplicationELB"
      metric_name = "HTTPCode_ELB_5XX_Count"
      period      = 300
      stat        = "Sum"
      dimensions  = { LoadBalancer = var.alb_arn_suffix }
    }
  }

  metric_query {
    id = "target"
    metric {
      namespace   = "AWS/ApplicationELB"
      metric_name = "HTTPCode_Target_5XX_Count"
      period      = 300
      stat        = "Sum"
      dimensions  = { LoadBalancer = var.alb_arn_suffix }
    }
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "unhealthy_targets" {
  count = var.alb_arn_suffix != null && var.target_group_arn_suffix != null ? 1 : 0

  alarm_name          = "${var.name}-api-unhealthy-targets"
  alarm_description   = "At least one api target failing /health/ready"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "UnHealthyHostCount"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 3
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.actions
  ok_actions          = local.actions

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  tags = var.tags
}

# --- RDS ---------------------------------------------------------------------

locals {
  rds_alarms = var.db_instance_identifier == null ? {} : {
    cpu = {
      metric      = "CPUUtilization"
      statistic   = "Average"
      operator    = "GreaterThanThreshold"
      threshold   = var.db_cpu_threshold
      description = "RDS CPU above ${var.db_cpu_threshold}%"
    }
    free-storage = {
      metric      = "FreeStorageSpace"
      statistic   = "Minimum"
      operator    = "LessThanThreshold"
      threshold   = var.db_free_storage_threshold_bytes
      description = "RDS free storage low"
    }
    free-memory = {
      metric      = "FreeableMemory"
      statistic   = "Minimum"
      operator    = "LessThanThreshold"
      threshold   = var.db_free_memory_threshold_bytes
      description = "RDS freeable memory low"
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "rds" {
  for_each = local.rds_alarms

  alarm_name          = "${var.name}-rds-${each.key}"
  alarm_description   = each.value.description
  namespace           = "AWS/RDS"
  metric_name         = each.value.metric
  statistic           = each.value.statistic
  period              = 300
  evaluation_periods  = 2
  threshold           = each.value.threshold
  comparison_operator = each.value.operator
  treat_missing_data  = "breaching"
  alarm_actions       = local.actions
  ok_actions          = local.actions

  dimensions = {
    DBInstanceIdentifier = var.db_instance_identifier
  }

  tags = var.tags
}

# --- ECS ---------------------------------------------------------------------

locals {
  ecs_alarms = var.ecs_cluster_name == null ? {} : merge([
    for svc in var.ecs_service_names : {
      "${svc}-cpu"    = { service = svc, metric = "CPUUtilization", threshold = var.ecs_cpu_threshold }
      "${svc}-memory" = { service = svc, metric = "MemoryUtilization", threshold = var.ecs_memory_threshold }
    }
  ]...)
}

resource "aws_cloudwatch_metric_alarm" "ecs" {
  for_each = local.ecs_alarms

  alarm_name          = "${each.key}-high"
  alarm_description   = "${each.value.service} ${each.value.metric} above ${each.value.threshold}%"
  namespace           = "AWS/ECS"
  metric_name         = each.value.metric
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  threshold           = each.value.threshold
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.actions
  ok_actions          = local.actions

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = each.value.service
  }

  tags = var.tags
}
