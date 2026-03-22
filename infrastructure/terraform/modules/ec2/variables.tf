variable "name" {
  description = "Name prefix for EC2 resources"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t4g.micro"
}

variable "ami_id" {
  description = "AMI ID for the instance. If empty, uses latest Amazon Linux 2023"
  type        = string
  default     = ""
}

variable "subnet_id" {
  description = "Subnet ID for the instance"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for security group"
  type        = string
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
}

variable "docker_compose_file" {
  description = "Path to docker-compose file to upload"
  type        = string
  default     = ""
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "root_volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 100
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
