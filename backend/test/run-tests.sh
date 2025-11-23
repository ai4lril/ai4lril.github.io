#!/bin/bash

# Voice Data Collection Backend Test Suite
# Comprehensive testing script for unit, integration, performance, and e2e tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_ENV=${TEST_ENV:-test}
NODE_ENV=${NODE_ENV:-test}
LOG_LEVEL=${LOG_LEVEL:-error}

# Database configuration for tests
TEST_DB_HOST=${TEST_DB_HOST:-localhost}
TEST_DB_PORT=${TEST_DB_PORT:-5433}
TEST_DB_NAME=${TEST_DB_NAME:-voice_data_test}
TEST_DB_USER=${TEST_DB_USER:-test_user}
TEST_DB_PASSWORD=${TEST_DB_PASSWORD:-test_password}

# Performance test configuration
PERFORMANCE_DURATION=${PERFORMANCE_DURATION:-60}  # seconds
PERFORMANCE_CONCURRENCY=${PERFORMANCE_CONCURRENCY:-10}
PERFORMANCE_RPS_THRESHOLD=${PERFORMANCE_RPS_THRESHOLD:-100}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Setup test environment
setup_test_env() {
    log_info "Setting up test environment..."

    # Create test database if it doesn't exist
    if ! pg_isready -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER -d $TEST_DB_NAME >/dev/null 2>&1; then
        log_warning "Test database not available. Using in-memory SQLite for unit tests."
        export TEST_DB_URL="file:./test.db"
    else
        export TEST_DB_URL="postgresql://$TEST_DB_USER:$TEST_DB_PASSWORD@$TEST_DB_HOST:$TEST_DB_PORT/$TEST_DB_NAME"
    fi

    # Set environment variables
    export NODE_ENV=$NODE_ENV
    export LOG_LEVEL=$LOG_LEVEL
    export DATABASE_URL=$TEST_DB_URL
    export REDIS_URL="redis://localhost:6378"
    export JWT_SECRET="test_jwt_secret_key_for_testing_only"

    log_success "Test environment setup complete"
}

# Clean up test artifacts
cleanup_test_artifacts() {
    log_info "Cleaning up test artifacts..."

    # Remove test database files
    rm -f test.db test.db-*

    # Remove test logs
    rm -f logs/test-*.log

    # Clean coverage reports
    rm -rf coverage/

    log_success "Cleanup complete"
}

# Run unit tests
run_unit_tests() {
    log_info "Running unit tests..."

    if ! npm test -- --testPathPattern=unit --coverage --coverageDirectory=coverage/unit; then
        log_error "Unit tests failed"
        return 1
    fi

    log_success "Unit tests passed"
}

# Run integration tests
run_integration_tests() {
    log_info "Running integration tests..."

    # Start test services
    docker-compose -f docker-compose.test.yml up -d

    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10

    # Run integration tests
    if ! npm run test:e2e -- --testPathPattern=integration; then
        log_error "Integration tests failed"
        docker-compose -f docker-compose.test.yml down
        return 1
    fi

    # Stop test services
    docker-compose -f docker-compose.test.yml down

    log_success "Integration tests passed"
}

# Run performance tests
run_performance_tests() {
    log_info "Running performance tests..."

    # Install artillery if not available
    if ! command -v artillery &> /dev/null; then
        log_warning "Artillery not found. Installing globally..."
        npm install -g artillery
    fi

    # Run performance tests
    log_info "Running load tests for $PERFORMANCE_DURATION seconds with $PERFORMANCE_CONCURRENCY concurrent users..."

    artillery run test/performance/load-test.yml \
        --environment test \
        --overrides "{\"config\":{\"phases\":[{\"duration\":$PERFORMANCE_DURATION,\"arrivalRate\":$PERFORMANCE_CONCURRENCY}]}}"

    # Check performance results
    if [ -f reports/performance.json ]; then
        local rps=$(jq '.aggregate.rps.mean' reports/performance.json 2>/dev/null || echo "0")
        local response_time=$(jq '.aggregate.latency.median' reports/performance.json 2>/dev/null || echo "0")

        log_info "Performance Results:"
        log_info "  - Requests per second: $rps"
        log_info "  - Median response time: ${response_time}ms"

        # Check thresholds
        if (( $(echo "$rps < $PERFORMANCE_RPS_THRESHOLD" | bc -l 2>/dev/null || echo "1") )); then
            log_warning "RPS below threshold ($PERFORMANCE_RPS_THRESHOLD)"
        else
            log_success "RPS meets threshold"
        fi

        if (( $(echo "$response_time > 500" | bc -l 2>/dev/null || echo "0") )); then
            log_warning "Response time above 500ms threshold"
        else
            log_success "Response time within acceptable limits"
        fi
    else
        log_error "Performance test report not found"
        return 1
    fi

    log_success "Performance tests completed"
}

# Run security tests
run_security_tests() {
    log_info "Running security tests..."

    # Run OWASP ZAP baseline scan if available
    if command -v zap-baseline.py &> /dev/null; then
        log_info "Running OWASP ZAP security scan..."
        zap-baseline.py -t http://localhost:3001/api -r reports/security.html
    else
        log_warning "OWASP ZAP not available. Skipping automated security scan."
    fi

    # Run npm audit
    log_info "Running npm audit for vulnerabilities..."
    if ! npm audit --audit-level high; then
        log_warning "High-severity vulnerabilities found. Please review."
    else
        log_success "No high-severity vulnerabilities found"
    fi

    # Run custom security tests
    if ! npm test -- --testPathPattern=security; then
        log_error "Security tests failed"
        return 1
    fi

    log_success "Security tests completed"
}

# Run all tests
run_all_tests() {
    local start_time=$(date +%s)
    local failed_tests=()

    log_info "Starting comprehensive test suite..."

    # Setup
    setup_test_env

    # Run unit tests
    if ! run_unit_tests; then
        failed_tests+=("unit")
    fi

    # Run integration tests
    if ! run_integration_tests; then
        failed_tests+=("integration")
    fi

    # Run performance tests
    if ! run_performance_tests; then
        failed_tests+=("performance")
    fi

    # Run security tests
    if ! run_security_tests; then
        failed_tests+=("security")
    fi

    # Generate test report
    generate_test_report "$start_time" "${failed_tests[@]}"

    # Cleanup
    cleanup_test_artifacts

    # Exit with appropriate code
    if [ ${#failed_tests[@]} -eq 0 ]; then
        log_success "All tests passed! 🎉"
        exit 0
    else
        log_error "Tests failed: ${failed_tests[*]}"
        exit 1
    fi
}

# Generate comprehensive test report
generate_test_report() {
    local start_time=$1
    shift
    local failed_tests=("$@")
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    log_info "Generating test report..."

    cat > reports/test-summary.json << EOF
{
  "timestamp": "$(date -Iseconds)",
  "duration_seconds": $duration,
  "environment": "$TEST_ENV",
  "failed_tests": [$(printf '"%s",' "${failed_tests[@]}" | sed 's/,$//')],
  "coverage": $(jq -r '.total.lines.pct' coverage/unit/lcov-report/index.html 2>/dev/null || echo "null"),
  "performance": {
    "rps": $(jq -r '.aggregate.rps.mean' reports/performance.json 2>/dev/null || echo "null"),
    "response_time_ms": $(jq -r '.aggregate.latency.median' reports/performance.json 2>/dev/null || echo "null")
  },
  "security": {
    "vulnerabilities": $(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.total' 2>/dev/null || echo "null"),
    "high_severity": $(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.high' 2>/dev/null || echo "null")
  }
}
EOF

    log_success "Test report generated: reports/test-summary.json"
}

# Parse command line arguments
case "${1:-all}" in
    "unit")
        setup_test_env
        run_unit_tests
        cleanup_test_artifacts
        ;;
    "integration")
        setup_test_env
        run_integration_tests
        cleanup_test_artifacts
        ;;
    "performance")
        setup_test_env
        run_performance_tests
        cleanup_test_artifacts
        ;;
    "security")
        setup_test_env
        run_security_tests
        cleanup_test_artifacts
        ;;
    "all")
        run_all_tests
        ;;
    *)
        echo "Usage: $0 {unit|integration|performance|security|all}"
        echo "  unit        - Run unit tests only"
        echo "  integration - Run integration tests only"
        echo "  performance - Run performance tests only"
        echo "  security    - Run security tests only"
        echo "  all         - Run all tests (default)"
        exit 1
        ;;
esac
