.PHONY: help install install-dev test lint format type-check clean build docs

help:  ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install package
	pip install -e .

install-dev:  ## Install package with development dependencies
	pip install -e ".[dev]"
	pre-commit install

test:  ## Run tests
	pytest

test-cov:  ## Run tests with coverage report
	pytest --cov --cov-report=html --cov-report=term

test-verbose:  ## Run tests with verbose output
	pytest -vv

lint:  ## Run all linters
	black --check src tests
	isort --check-only src tests
	ruff check src tests

format:  ## Format code with black and isort
	black src tests
	isort src tests
	ruff check --fix src tests

type-check:  ## Run type checker
	mypy src

quality:  ## Run all quality checks (lint + type-check)
	$(MAKE) lint
	$(MAKE) type-check

clean:  ## Clean build artifacts and cache
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf .pytest_cache
	rm -rf .mypy_cache
	rm -rf .ruff_cache
	rm -rf htmlcov
	rm -rf .coverage
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

build:  ## Build distribution packages
	python -m build

docs:  ## Generate documentation
	@echo "Documentation generation not yet configured"

benchmark:  ## Run performance benchmarks
	pytest tests/ -m benchmark --benchmark-only

profile:  ## Run profiling on tests
	pytest tests/ --profile

pre-commit:  ## Run pre-commit hooks on all files
	pre-commit run --all-files

evaluate:  ## Run parser evaluation on fixtures
	python -m sentri_worker --evaluate-fixture-dir tests/fixtures

ci:  ## Run CI checks locally
	$(MAKE) format
	$(MAKE) quality
	$(MAKE) test-cov
