output "state_bucket_name" {
  description = "State bucket name for backend.hcl."
  value       = aws_s3_bucket.state.id
}

output "state_bucket_arn" {
  description = "State bucket ARN."
  value       = aws_s3_bucket.state.arn
}
