variable "name_prefix" {
  description = "Secret name prefix, for example aptiverse/dev. Secrets are named <prefix>/<key>."
  type        = string
}

variable "secrets" {
  description = "Secret key to description. Each becomes an empty Secrets Manager secret; values are set out of band."
  type        = map(string)
  default = {
    "jwt-signing-key" = "ES256 private key (PEM) used by the api to sign access tokens."
    "db-app"          = "JSON: username, password. Runtime Postgres login for the api and worker; the migration task creates the role with this password."
    "auth-session"    = "Auth.js session encryption secret shared with the web BFF."
    "paystack"        = "JSON: secret_key, public_key, webhook_secret."
    "anthropic"       = "JSON: api_key."
    "openai"          = "JSON: api_key. Used by the ai service for cross-family judging, second marking and embeddings."
    "ai-db"           = "JSON: username, password. Runtime Postgres login for the ai service; its migration task creates the role."
    "langfuse"        = "JSON: host, public_key, secret_key for LLM tracing (content redacted before export)."
    "sentry-dsn"      = "Sentry DSN for the api and worker."
    "google-oauth"    = "JSON: client_id, client_secret."
    "meta-capi"       = "JSON: pixel_id, access_token for the Meta Conversions API."
    "grafana-otlp"    = "JSON: endpoint, otlp_headers (Authorization=Basic ...) for OTLP export to Grafana Cloud."
  }
}

variable "recovery_window_in_days" {
  description = "Days a deleted secret can still be restored (0 deletes immediately)."
  type        = number
  default     = 7
}

variable "kms_key_arn" {
  description = "Optional KMS key. Null uses the AWS managed aws/secretsmanager key."
  type        = string
  default     = null
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
