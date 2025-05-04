package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"

	"github.com/aptiverse/event-architecture/internal/api"
	"github.com/aptiverse/event-architecture/internal/broker/kafka"
	"github.com/aptiverse/event-architecture/internal/broker/rabbitmq"
	"github.com/aptiverse/event-architecture/internal/config"
	"github.com/aptiverse/event-architecture/internal/dedup"
	"github.com/aptiverse/event-architecture/internal/metrics"
	"github.com/aptiverse/event-architecture/internal/router"
)

func main() {
	// Logger.
	logger, err := zap.NewProduction()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to create logger: %v\n", err)
		os.Exit(1)
	}
	defer logger.Sync()

	// Config.
	cfg, err := config.Load()
	if err != nil {
		logger.Fatal("failed to load config", zap.Error(err))
	}

	logger.Info("starting event server",
		zap.String("environment", cfg.Environment),
		zap.Int("port", cfg.ServerPort),
	)

	// Prometheus metrics.
	metrics.Register()

	// Kafka producer.
	kafkaProducer, err := kafka.NewProducer(cfg, logger)
	if err != nil {
		logger.Fatal("failed to create kafka producer", zap.Error(err))
	}
	defer kafkaProducer.Close()

	// RabbitMQ publisher.
	rabbitPublisher, err := rabbitmq.NewPublisher(cfg, logger)
	if err != nil {
		logger.Fatal("failed to create rabbitmq publisher", zap.Error(err))
	}
	defer rabbitPublisher.Close()

	// Deduplicator.
	deduplicator, err := dedup.New(cfg.DedupWindowSize, cfg.DedupTTL)
	if err != nil {
		logger.Fatal("failed to create deduplicator", zap.Error(err))
	}

	// Router.
	eventRouter := router.New(kafkaProducer, rabbitPublisher, logger)

	// HTTP server.
	handler := api.NewServer(cfg, kafkaProducer, rabbitPublisher, eventRouter, deduplicator, logger)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.ServerPort),
		Handler:      handler,
		ReadTimeout:  cfg.ServerReadTimeout,
		WriteTimeout: cfg.ServerWriteTimeout,
	}

	// Graceful shutdown.
	errCh := make(chan error, 1)
	go func() {
		logger.Info("http server listening", zap.String("addr", srv.Addr))
		errCh <- srv.ListenAndServe()
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		logger.Info("received shutdown signal", zap.String("signal", sig.String()))
	case err := <-errCh:
		if err != nil && err != http.ErrServerClosed {
			logger.Fatal("http server error", zap.Error(err))
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("http server shutdown error", zap.Error(err))
	}

	logger.Info("server stopped")
}
