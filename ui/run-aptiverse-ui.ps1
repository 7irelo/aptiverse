#!/usr/bin/env pwsh
docker run --name aptiverse-ui -d -p 3000:3000 --env-file .env.production aptiverse-ui:dev
docker ps --filter "name=aptiverse-ui"