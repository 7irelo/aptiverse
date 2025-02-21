.PHONY: build run test lint proto clean docker docker-compose-up docker-compose-down

BINARY_NAME=event-server
MODULE=github.com/aptiverse/event-architecture

build:
	go build -o bin/$(BINARY_NAME) ./cmd/server

run: build
	./bin/$(BINARY_NAME)

test:
	go test -race -cover ./...

lint:
	go vet ./...
	staticcheck ./...

proto:
	buf generate

proto-lint:
	buf lint

clean:
	rm -rf bin/ gen/proto/

docker:
	docker build -f deployments/docker/Dockerfile -t aptiverse/event-server:latest .

docker-compose-up:
	docker-compose -f deployments/docker-compose.yml up -d

docker-compose-down:
	docker-compose -f deployments/docker-compose.yml down

tidy:
	go mod tidy
