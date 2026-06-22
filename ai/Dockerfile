# CPU base image. A CUDA variant can be layered later for heavy transformer jobs.
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Build deps for lightgbm / numpy / sentence-transformers wheels.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libgomp1 && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
RUN pip install --upgrade pip && pip install .

COPY app ./app

EXPOSE 8000

# Default process = FastAPI control surface. The worker and scheduler run as
# separate containers/commands (see infra compose):
#   worker    : arq app.worker.WorkerSettings
#   scheduler : python -m app.scheduler
#   events    : python -m app.events.consumer
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
