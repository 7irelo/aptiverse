provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      project = "aptiverse"
      env     = var.env
    }
  }
}

# -----------------------------------------------------------------------------
# Default VPC + subnets — free tier doesn't justify a custom VPC + NAT GW
# -----------------------------------------------------------------------------
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# -----------------------------------------------------------------------------
# Security groups
# -----------------------------------------------------------------------------
resource "aws_security_group" "api" {
  name        = "aptiverse-${var.env}-api"
  description = "EC2 host for the Aptiverse API"
  vpc_id      = data.aws_vpc.default.id

  # SSH — lock to your IP via terraform.tfvars (ssh_allowed_cidrs)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidrs
  }

  # HTTP — Cloudflare proxy hits this. Lock to Cloudflare IP ranges
  # (https://www.cloudflare.com/ips-v4) for a tighter origin.
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.http_allowed_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name        = "aptiverse-${var.env}-rds"
  description = "RDS Postgres for Aptiverse"
  vpc_id      = data.aws_vpc.default.id

  # Only the API EC2 SG can reach the database
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# -----------------------------------------------------------------------------
# SSH keypair — generated locally; private key written next to this file
# -----------------------------------------------------------------------------
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "api" {
  key_name   = "aptiverse-${var.env}"
  public_key = tls_private_key.ssh.public_key_openssh
}

resource "local_sensitive_file" "ssh_private_key" {
  content         = tls_private_key.ssh.private_key_pem
  filename        = "${path.module}/aptiverse-${var.env}.pem"
  file_permission = "0400"
}

# -----------------------------------------------------------------------------
# RDS Postgres — free tier: db.t3.micro, 20 GB gp2, single-AZ, no backup
# -----------------------------------------------------------------------------
resource "aws_db_subnet_group" "default" {
  name       = "aptiverse-${var.env}"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_db_instance" "postgres" {
  identifier              = "aptiverse-${var.env}"
  engine                  = "postgres"
  engine_version          = "16"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  storage_type            = "gp2"
  db_name                 = "aptiverse"
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.default.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  publicly_accessible     = false
  skip_final_snapshot     = true
  backup_retention_period = 0
  deletion_protection     = false
}

# -----------------------------------------------------------------------------
# EC2 — free tier: t3.micro, Amazon Linux 2023, 8 GB gp3
# -----------------------------------------------------------------------------
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "api" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.api.key_name
  vpc_security_group_ids = [aws_security_group.api.id]
  subnet_id              = data.aws_subnets.default.ids[0]

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  user_data = <<-EOF
    #!/bin/bash
    set -e
    dnf update -y
    dnf install -y docker git
    systemctl enable --now docker
    usermod -aG docker ec2-user
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 \
      -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    mkdir -p /opt/aptiverse
    chown ec2-user:ec2-user /opt/aptiverse
  EOF

  tags = {
    Name = "aptiverse-${var.env}-api"
  }
}

resource "aws_eip" "api" {
  domain = "vpc"
}

resource "aws_eip_association" "api" {
  instance_id   = aws_instance.api.id
  allocation_id = aws_eip.api.id
}
