locals {
  default_tags = {
    project    = "aptiverse"
    managed_by = "terraform"
    repo       = "aptiverse-labs/infra"
    stack      = "global"
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = local.default_tags
  }
}

provider "aws" {
  alias  = "eu_west_1"
  region = var.ses_region

  default_tags {
    tags = local.default_tags
  }
}

# Reads CLOUDFLARE_API_TOKEN from the environment.
provider "cloudflare" {}
