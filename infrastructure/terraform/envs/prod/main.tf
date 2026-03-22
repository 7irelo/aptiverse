provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      project = "aptiverse"
      env     = var.env
    }
  }
}

locals {
  name = "aptiverse-${var.env}"
}

# -------------------------------------------------------------------
# VPC
# -------------------------------------------------------------------
module "vpc" {
  source = "../../modules/vpc"

  name                 = local.name
  env                  = var.env
  vpc_cidr             = var.vpc_cidr
  azs                  = var.azs
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  enable_nat_gateway   = true
  single_nat_gateway   = false
  tags                 = var.tags
}

# -------------------------------------------------------------------
# Security
# -------------------------------------------------------------------
module "security" {
  source = "../../modules/security"

  name     = local.name
  env      = var.env
  vpc_id   = module.vpc.vpc_id
  vpc_cidr = var.vpc_cidr
  tags     = var.tags
}

# -------------------------------------------------------------------
# EKS Cluster (On-Demand instances)
# -------------------------------------------------------------------
module "eks" {
  source = "../../modules/eks"

  name                = local.name
  env                 = var.env
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnet_ids
  node_instance_types = var.eks_node_instance_types
  node_desired_size   = var.eks_node_desired_size
  node_min_size       = 2
  node_max_size       = 6
  node_capacity_type  = "ON_DEMAND"
  tags                = var.tags
}

# -------------------------------------------------------------------
# RDS PostgreSQL (Multi-AZ)
# -------------------------------------------------------------------
module "rds" {
  source = "../../modules/rds"

  name                       = local.name
  env                        = var.env
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  instance_class             = var.db_instance_class
  db_username                = var.db_username
  db_password                = var.db_password
  multi_az                   = true
  allowed_security_group_ids = [module.eks.cluster_security_group_id, module.security.app_security_group_id]
  backup_retention_period    = 14
  tags                       = var.tags
}

# -------------------------------------------------------------------
# ElastiCache Redis
# -------------------------------------------------------------------
module "elasticache" {
  source = "../../modules/elasticache"

  name                       = local.name
  env                        = var.env
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  node_type                  = var.redis_node_type
  allowed_security_group_ids = [module.eks.cluster_security_group_id, module.security.app_security_group_id]
  tags                       = var.tags
}

# -------------------------------------------------------------------
# ALB
# -------------------------------------------------------------------
module "alb" {
  source = "../../modules/alb"

  name            = local.name
  env             = var.env
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.public_subnet_ids
  certificate_arn = var.certificate_arn
  tags            = var.tags
}

# -------------------------------------------------------------------
# Route 53
# -------------------------------------------------------------------
module "route53" {
  source = "../../modules/route53"

  domain_name = var.domain_name

  records = [
    {
      name = var.domain_name
      type = "A"
      alias = {
        name                   = module.alb.alb_dns_name
        zone_id                = module.alb.alb_zone_id
        evaluate_target_health = true
      }
    },
    {
      name = "api.${var.domain_name}"
      type = "A"
      alias = {
        name                   = module.alb.alb_dns_name
        zone_id                = module.alb.alb_zone_id
        evaluate_target_health = true
      }
    }
  ]

  tags = var.tags
}
