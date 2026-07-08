provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      project    = "aptiverse"
      managed_by = "terraform"
      component  = "ses"
      env        = var.env
    }
  }
}
