# Only the secret containers are managed here. No aws_secretsmanager_secret_version
# exists in this repo on purpose: values are written out of band
# (aws secretsmanager put-secret-value) so they never land in Terraform state.
resource "aws_secretsmanager_secret" "this" {
  for_each = var.secrets

  name                    = "${var.name_prefix}/${each.key}"
  description             = each.value
  recovery_window_in_days = var.recovery_window_in_days
  kms_key_id              = var.kms_key_arn

  tags = merge(var.tags, { Name = "${var.name_prefix}/${each.key}" })
}
