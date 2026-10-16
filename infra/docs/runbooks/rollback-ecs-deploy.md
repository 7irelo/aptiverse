# Runbook: roll back an ECS deploy

## Automatic rollback

Every service has the deployment circuit breaker with rollback enabled. If new tasks fail to start or fail the `/health/ready` check repeatedly, ECS stops the rollout and returns to the last steady task definition on its own. Check what happened:

```bash
aws ecs describe-services --cluster aptiverse-<env> --services aptiverse-<env>-api \
  --query 'services[0].deployments[].{status:status,rollout:rolloutState,reason:rolloutStateReason,td:taskDefinition}'
```

Then fix forward in the api repo. Note that after an automatic rollback the SSM image tag still names the failed sha; set it back (step 1 below) so the next infra apply does not redeploy the broken image.

## Manual rollback (deploy succeeded but the release is bad)

1. Point the image tag back at the last good sha:
   ```bash
   aws ssm put-parameter --name /aptiverse/<env>/api/image-tag --value <good-sha> --overwrite
   ```
2. Run the infra apply for that env (CI workflow, or a reviewed local plan and apply). This registers task definitions for the good image and ECS rolls the api and worker with the same circuit breaker protection.
3. Emergency only, when CI is unavailable: point the services at the previous task definition revision directly, then reconcile with an infra apply as soon as possible:
   ```bash
   aws ecs update-service --cluster aptiverse-<env> --service aptiverse-<env>-api \
     --task-definition aptiverse-<env>-api:<previous revision>
   ```

## Database migrations

Rolling back the image does not roll back a migration. Migrations must be backward compatible with the previous release (expand, then contract in a later release). If a migration itself is the problem, write a corrective forward migration; restore from PITR (see `restore-rds.md`) only for data loss.

## Afterwards

Confirm `/health/ready`, check Sentry and Grafana for the error rate returning to normal, and note the incident.
