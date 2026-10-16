variable "region" {
  description = "Region of the state bucket."
  type        = string
  default     = "af-south-1"
}

variable "state_bucket_name" {
  description = "Name of the Terraform state bucket."
  type        = string
  default     = "aptiverse-terraform-state-483527586058"
}
