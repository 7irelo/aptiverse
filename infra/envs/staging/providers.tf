provider "aws" {
  region = var.region

  default_tags {
    tags = {
      project     = "aptiverse"
      environment = var.environment
      managed_by  = "terraform"
      repo        = "aptiverse-labs/infra"
    }
  }
}

# Reads CLOUDFLARE_API_TOKEN from the environment.
provider "cloudflare" {}
