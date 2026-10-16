output "sns_topic_arn" {
  description = "Alarm topic ARN."
  value       = aws_sns_topic.alarms.arn
}
