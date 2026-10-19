output "service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.this.name
}

output "service_arn" {
  description = "ECS service ARN."
  value       = aws_ecs_service.this.id
}

output "task_definition_arn" {
  description = "Current task definition revision ARN."
  value       = aws_ecs_task_definition.this.arn
}

output "task_definition_family" {
  description = "Task definition family."
  value       = aws_ecs_task_definition.this.family
}

output "migration_task_definition_arn" {
  description = "Migration task definition revision ARN, or null when not created."
  value       = try(aws_ecs_task_definition.migration[0].arn, null)
}

output "migration_task_definition_family" {
  description = "Migration task definition family, or null when not created."
  value       = try(aws_ecs_task_definition.migration[0].family, null)
}

output "security_group_id" {
  description = "Security group attached to the tasks."
  value       = aws_security_group.this.id
}

output "task_role_arn" {
  description = "Task role ARN."
  value       = aws_iam_role.task.arn
}

output "execution_role_arn" {
  description = "Execution role ARN."
  value       = aws_iam_role.execution.arn
}

output "log_group_name" {
  description = "CloudWatch log group for the service and its migration task."
  value       = aws_cloudwatch_log_group.this.name
}

output "log_group_arn" {
  description = "CloudWatch log group ARN."
  value       = aws_cloudwatch_log_group.this.arn
}

output "migration_task_role_arn" {
  description = "Migration task role ARN (no permissions), or null when not created."
  value       = try(aws_iam_role.migration_task[0].arn, null)
}

output "migration_execution_role_arn" {
  description = "Migration execution role ARN, or null when not created."
  value       = try(aws_iam_role.migration_execution[0].arn, null)
}
