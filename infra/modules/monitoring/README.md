# monitoring

SNS alarm topic (encrypted with its own CMK, since CloudWatch cannot publish to a topic on the AWS managed SNS key) with email subscriptions from `alarm_emails`, plus CloudWatch alarms:

- ALB: ELB plus target 5xx count over 5 minutes; api target group unhealthy hosts for 3 minutes.
- RDS: CPU, free storage and freeable memory (missing data counts as breaching, so a stopped instance alarms).
- ECS: CPU and memory per service in `ecs_service_names`.

Each group is skipped when its identifying input is null. Subscribers must confirm the AWS email before alarms are delivered. Application-level alerting (error rates, latency SLOs) lives in Grafana and Sentry.
