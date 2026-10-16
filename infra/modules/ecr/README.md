# ecr

ECR repositories named `<name_prefix>/<name>` with immutable tags, scan on push, encryption and a lifecycle policy (untagged images expire after `untagged_expiry_days`, only the newest `keep_tagged_images` are kept).

Images are tagged with the git sha by the api pipeline. Never push `:latest`; immutability rejects re-pushing an existing tag anyway.

Outputs: `repository_urls`, `repository_arns` (maps keyed by short name).
