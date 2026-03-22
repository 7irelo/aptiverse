output "endpoint" {
  description = "ElastiCache cluster endpoint"
  value       = aws_elasticache_cluster.this.cache_nodes[0].address
}

output "port" {
  description = "ElastiCache cluster port"
  value       = aws_elasticache_cluster.this.port
}

output "security_group_id" {
  description = "Security group ID for the ElastiCache cluster"
  value       = aws_security_group.redis.id
}

output "connection_string" {
  description = "Redis connection string for .NET services"
  value       = "${aws_elasticache_cluster.this.cache_nodes[0].address}:${aws_elasticache_cluster.this.port},abortConnect=false"
}
