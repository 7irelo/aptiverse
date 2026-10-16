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
# RDS Postgres — free tier: db.t3.micro, 20 GB gp2, single-AZ.
#
# Backups are ON and cost nothing here: the RDS free tier includes backup
# storage up to the allocated size (20 GB), and this database holds far less
# than that. It previously ran with retention 0, no final snapshot and no
# deletion protection, which meant one bad migration or one careless destroy
# ended the company. It now stores paying-customer records and a POPIA consent
# trail, so that is not a risk worth carrying for zero saving.
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

  # One day of point-in-time recovery. This is the ceiling: AWS rejects
  # anything higher on this account with FreeTierRestrictionError, since the
  # free plan caps retention rather than only capping backup storage. One day
  # is a small window, but the gap between one and zero is the gap between a
  # recoverable mistake and a terminal one. Raise this to 7 the moment the
  # account moves off the free plan.
  backup_retention_period = 1
  # 01:00-02:00 UTC is 03:00-04:00 SAST, the quietest hour for a South African
  # student audience. The maintenance window must not overlap it.
  backup_window           = "01:00-02:00"
  maintenance_window      = "sun:02:30-sun:03:30"
  copy_tags_to_snapshot   = true

  # A destroy now leaves a restorable snapshot behind instead of nothing, and
  # deletion protection means an accidental destroy fails rather than
  # succeeding. Turning the database off is now a deliberate two-step act.
  skip_final_snapshot       = false
  final_snapshot_identifier = "aptiverse-${var.env}-final"
  deletion_protection       = true

  # Going from retention 0 to non-zero briefly suspends I/O on a single-AZ
  # instance while the first backup is taken. Applying immediately accepts a
  # few seconds of interruption now rather than leaving the data unprotected
  # until the next maintenance window.
  apply_immediately = true
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

  # Guard against AMI drift. `data.aws_ami.al2023` with most_recent = true
  # resolves to a newer image whenever AWS publishes one, which would otherwise
  # force-replace this instance on the next apply (as happened once). Ignore ami
  # + user_data so re-imaging is a deliberate act (terraform taint / -replace),
  # never a surprise side effect of an unrelated apply.
  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

resource "aws_eip" "api" {
  domain = "vpc"
}

resource "aws_eip_association" "api" {
  instance_id   = aws_instance.api.id
  allocation_id = aws_eip.api.id
}
