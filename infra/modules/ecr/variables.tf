variable "name_prefix" {
  description = "Repository name prefix, for example aptiverse-dev. Repositories are named <prefix>/<name>."
  type        = string
}

variable "repositories" {
  description = "Repository short names to create."
  type        = list(string)
  default     = ["api"]
}

variable "keep_tagged_images" {
  description = "Number of most recent images to keep per repository."
  type        = number
  default     = 30
}

variable "untagged_expiry_days" {
  description = "Delete untagged images after this many days."
  type        = number
  default     = 7
}

variable "kms_key_arn" {
  description = "Optional KMS key for repository encryption. Null uses AES256."
  type        = string
  default     = null
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
