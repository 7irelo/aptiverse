data "aws_vpc" "this" {
  id = var.vpc_id
}

locals {
  ingress = {
    for pair in setproduct(var.cloudflare_ipv4_cidrs, [80, 443]) :
    "${pair[0]}-${pair[1]}" => { cidr = pair[0], port = pair[1] }
  }
}

# --- Certificate -------------------------------------------------------------

resource "aws_acm_certificate" "this" {
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = "DNS"
  key_algorithm             = "EC_prime256v1"

  tags = merge(var.tags, { Name = var.domain_name })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "this" {
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = var.certificate_validation_record_fqdns
}

# --- Security group: Cloudflare edge only ------------------------------------

resource "aws_security_group" "this" {
  name        = "${var.name}-alb"
  description = "ALB ingress from Cloudflare only"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, { Name = "${var.name}-alb" })
}

resource "aws_vpc_security_group_ingress_rule" "cloudflare" {
  for_each = local.ingress

  security_group_id = aws_security_group.this.id
  description       = "Cloudflare edge on ${each.value.port}"
  cidr_ipv4         = each.value.cidr
  ip_protocol       = "tcp"
  from_port         = each.value.port
  to_port           = each.value.port
}

resource "aws_vpc_security_group_egress_rule" "targets" {
  security_group_id = aws_security_group.this.id
  description       = "To targets inside the VPC"
  cidr_ipv4         = data.aws_vpc.this.cidr_block
  ip_protocol       = "tcp"
  from_port         = var.target_port
  to_port           = var.target_port
}

# --- Load balancer -----------------------------------------------------------

resource "aws_lb" "this" {
  name               = substr(var.name, 0, 32)
  load_balancer_type = "application"
  internal           = false
  subnets            = var.subnet_ids
  security_groups    = [aws_security_group.this.id]
  idle_timeout       = var.idle_timeout

  drop_invalid_header_fields = true
  enable_deletion_protection = var.deletion_protection

  dynamic "access_logs" {
    for_each = var.access_logs_bucket != null ? [1] : []
    content {
      bucket  = var.access_logs_bucket
      prefix  = var.name
      enabled = true
    }
  }

  tags = merge(var.tags, { Name = var.name })
}

resource "aws_lb_target_group" "api" {
  name                 = substr("${var.name}-api", 0, 32)
  port                 = var.target_port
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = var.vpc_id
  deregistration_delay = 30

  health_check {
    path                = var.health_check_path
    matcher             = "200"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = merge(var.tags, { Name = "${var.name}-api" })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = var.tags
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = var.ssl_policy
  certificate_arn   = aws_acm_certificate_validation.this.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  tags = var.tags
}
