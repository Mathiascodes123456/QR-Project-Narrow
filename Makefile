# QR Contact Generator Makefile

.PHONY: help install dev build start test clean lint format check

# Default target
help:
	@echo "QR Contact Generator - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     Install all dependencies"
	@echo "  dev         Start development servers (frontend + backend)"
	@echo "  server:dev  Start only backend server"
	@echo "  client:dev  Start only frontend development server"
	@echo ""
	@echo "Production:"
	@echo "  build       Build frontend for production"
	@echo "  start       Start production server"
	@echo ""
	@echo "Database:"
	@echo "  db:migrate  Run database migrations"
	@echo "  db:reset    Reset database (WARNING: deletes all data)"
	@echo ""
	@echo "Testing:"
	@echo "  test        Run all tests"
	@echo "  test:watch  Run tests in watch mode"
	@echo "  test:cov    Run tests with coverage"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint        Lint all code"
	@echo "  format      Format all code"
	@echo "  check       Run lint and tests"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean       Clean cache and temporary files"
	@echo "  deps:update Update all dependencies"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Development commands
dev:
	@echo "Starting development servers..."
	npm run dev

server:dev:
	@echo "Starting backend server..."
	npm run server:dev

client:dev:
	@echo "Starting frontend development server..."
	npm run client:dev

# Production commands
build:
	@echo "Building frontend for production..."
	npm run build

start:
	@echo "Starting production server..."
	npm start

# Database commands
db:migrate:
	@echo "Running database migrations..."
	npm run db:migrate

db:reset:
	@echo "WARNING: This will delete all data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "Resetting database..."
	rm -f qr_tracking.db
	npm run db:migrate

# Testing commands
test:
	@echo "Running tests..."
	npm test

test:watch:
	@echo "Running tests in watch mode..."
	npm run test:watch

test:cov:
	@echo "Running tests with coverage..."
	npm run test:cov

# Code quality commands
lint:
	@echo "Linting code..."
	npm run lint

format:
	@echo "Formatting code..."
	npm run format

check: lint test
	@echo "All checks passed!"

# Maintenance commands
clean:
	@echo "Cleaning cache and temporary files..."
	rm -rf node_modules/.cache
	rm -rf dist
	rm -rf build
	rm -rf coverage
	rm -rf .nyc_output
	rm -rf .parcel-cache
	rm -rf .fusebox
	rm -rf .vscode-test
	rm -f *.log
	rm -f *.pid
	rm -f *.seed
	rm -f *.pid.lock

deps:update:
	@echo "Updating dependencies..."
	npm update
	npm audit fix

# Setup commands
setup: install db:migrate
	@echo "Setup complete! Run 'make dev' to start development servers."

# Docker commands
docker:build:
	@echo "Building Docker image..."
	docker build -t qr-contact-generator .

docker:run:
	@echo "Running Docker container..."
	docker run -p 3000:3000 qr-contact-generator

# Backup commands
backup:db:
	@echo "Backing up database..."
	cp qr_tracking.db qr_tracking_backup_$(shell date +%Y%m%d_%H%M%S).db

restore:db:
	@echo "Available backups:"
	@ls -la qr_tracking_backup_*.db 2>/dev/null || echo "No backups found"
	@read -p "Enter backup filename: " backup && cp "$$backup" qr_tracking.db

# Health check
health:
	@echo "Checking application health..."
	@curl -s http://localhost:3000/api/health | jq . || echo "Server not running or health check failed"