#!/usr/bin/env bash
# Generate self-signed TLS certificates for local development with HTTP/2
# Output: certs/cert.pem, certs/key.pem (valid 365 days)
# Run before first `docker compose up` when using nginx with HTTPS

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CERTS_DIR="$PROJECT_ROOT/certs"

mkdir -p "$CERTS_DIR"
cd "$CERTS_DIR"

openssl req -x509 -newkey rsa:2048 -nodes -sha256 \
  -keyout key.pem -out cert.pem \
  -days 365 \
  -subj "/CN=localhost/O=ILHRF Dev/C=US"

echo "Generated self-signed certificates:"
echo "  - $CERTS_DIR/cert.pem"
echo "  - $CERTS_DIR/key.pem"
echo "Valid for 365 days. For production, use Let's Encrypt (see docs/HTTP2_TLS.md)."
