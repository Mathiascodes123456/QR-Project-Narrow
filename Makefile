.PHONY: dev test lint install clean

# Development server
dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
test:
	pytest tests/ -v

# Run tests with coverage
test-cov:
	pytest tests/ -v --cov=app --cov-report=html

# Lint code
lint:
	python -m flake8 app/ tests/
	python -m black --check app/ tests/

# Format code
format:
	python -m black app/ tests/

# Install dependencies
install:
	pip install -r requirements.txt

# Install development dependencies
install-dev: install
	pip install flake8 black coverage

# Clean up
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .coverage htmlcov/

# Run all checks
check: lint test

# Help
help:
	@echo "Available commands:"
	@echo "  dev        - Start development server"
	@echo "  test       - Run tests"
	@echo "  test-cov   - Run tests with coverage"
	@echo "  lint       - Lint code"
	@echo "  format     - Format code"
	@echo "  install    - Install dependencies"
	@echo "  install-dev- Install dev dependencies"
	@echo "  clean      - Clean up cache files"
	@echo "  check      - Run lint and tests"
	@echo "  help       - Show this help"
