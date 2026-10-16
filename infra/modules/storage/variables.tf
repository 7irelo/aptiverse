variable "bucket_name" {
  description = "Globally unique bucket name, for example aptiverse-dev-uploads-<account-id>."
  type        = string
}

variable "cors_allowed_origins" {
  description = "Origins allowed to PUT and GET through presigned URLs (the web app hosts)."
  type        = list(string)
}

variable "noncurrent_version_expiry_days" {
  description = "Delete overwritten or deleted object versions after this many days."
  type        = number
  default     = 30
}

variable "exports_expiry_days" {
  description = "Delete objects under exports/ after this many days."
  type        = number
  default     = 7
}

variable "tmp_expiry_days" {
  description = "Delete objects under tmp/ (abandoned presigned uploads) after this many days."
  type        = number
  default     = 2
}

variable "kms_key_arn" {
  description = "Optional KMS key for SSE-KMS. Null uses the AWS managed aws/s3 key."
  type        = string
  default     = null
}

variable "force_destroy" {
  description = "Allow destroying a non-empty bucket. Keep false outside throwaway environments."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
