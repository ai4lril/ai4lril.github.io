# HTTP/2 and TLS Configuration

This document describes how to run the ILHRF Data Collection Platform with HTTP/2 and TLS (HTTPS).

## Overview

HTTP/2 support is provided at the edge via a reverse proxy (nginx for Docker Compose, Ingress for Kubernetes). The proxy terminates TLS and HTTP/2, then proxies to the backend and frontend over HTTP/1.1. No changes to NestJS or Next.js application code are required.

**Benefits:**

- Multiplexing: multiple requests over a single connection
- Header compression
- TLS encryption for all traffic
- WebSocket (Socket.IO) works over the same TLS connection

---

## Docker Compose

### Prerequisites

- Docker and Docker Compose
- OpenSSL (for generating dev certs)

### Quick Start (Development with Self-Signed Certs)

1. **Generate self-signed certificates** (run once):

   ```bash
   ./scripts/generate-dev-certs.sh
   ```

   This creates `certs/cert.pem` and `certs/key.pem` (valid 365 days).

2. **Start the stack with HTTP/2**:

   ```bash
   docker compose -f compose.yml -f compose-http2.yml --profile http2 up -d
   ```

3. **Access the application**:
   - Open https://localhost in your browser
   - Accept the self-signed certificate warning (browser will show "Your connection is not private" — click Advanced → Proceed)
   - Frontend, API, and WebSocket all work over HTTPS

### Verify HTTP/2

```bash
curl -v --http2 -k https://localhost/
```

Look for `HTTP/2 200` in the output.

### Production: Let's Encrypt

For production with a real domain:

1. **Obtain certificates** using certbot:

   ```bash
   certbot certonly --standalone -d your-domain.com
   ```

   Certificates will be in `/etc/letsencrypt/live/your-domain.com/`.

2. **Update compose** to mount Let's Encrypt certs:

   Create a `compose.http2.prod.yml` or set env vars to point to your cert paths. Mount the certs:

   ```yaml
   volumes:
     - /etc/letsencrypt/live/your-domain.com/fullchain.pem:/etc/nginx/certs/cert.pem:ro
     - /etc/letsencrypt/live/your-domain.com/privkey.pem:/etc/nginx/certs/key.pem:ro
   ```

3. **Update OAuth callback URLs** in your OAuth provider (Google, GitHub) to use `https://your-domain.com`.

---

## Kubernetes (Helm)

### Prerequisites

- Kubernetes cluster with nginx-ingress controller (or compatible)
- TLS certificate or cert-manager for Let's Encrypt

### Enable Ingress

1. **Set `ingress.enabled: true`** in your values or override:

   ```yaml
   ingress:
     enabled: true
     className: nginx
     hosts:
       - host: api.your-domain.com
         paths:
           - path: /api
             pathType: Prefix
           - path: /socket.io
             pathType: Prefix
     tls:
       - hosts:
           - api.your-domain.com
         secretName: ilhrf-tls
   ```

2. **Create TLS secret** (if not using cert-manager):

   ```bash
   kubectl create secret tls ilhrf-tls \
     --cert=fullchain.pem \
     --key=privkey.pem \
     -n your-namespace
   ```

3. **Or use cert-manager** for automatic Let's Encrypt:

   ```yaml
   ingress:
     annotations:
       cert-manager.io/cluster-issuer: letsencrypt-prod
     tls:
       - hosts:
           - api.your-domain.com
         secretName: ilhrf-tls # cert-manager creates this
   ```

### HTTP/2

HTTP/2 is enabled by default when TLS is configured on nginx-ingress. The values include:

- `nginx.ingress.kubernetes.io/ssl-protocols: "TLSv1.2 TLSv1.3"`
- WebSocket timeouts for Socket.IO

---

## WebSocket Compatibility

Socket.IO uses HTTP/1.1 upgrade for WebSocket. Both nginx (Compose) and nginx-ingress (Kubernetes) support proxying WebSocket over TLS:

- **Compose**: The nginx config includes `proxy_http_version 1.1`, `Upgrade`, and `Connection` headers for `/socket.io/`
- **Kubernetes**: Ingress annotations set `proxy-read-timeout` and `proxy-send-timeout` for long-lived connections

The admin dashboard realtime updates and user notifications work over HTTPS.

---

## Troubleshooting

### nginx fails to start: "cannot load certificate"

Run `./scripts/generate-dev-certs.sh` before starting. Ensure `certs/cert.pem` and `certs/key.pem` exist.

### Browser shows "Mixed Content" errors

Ensure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_FRONTEND_URL` use `https://` when behind nginx. Use `compose-http2.yml` which sets these.

### WebSocket connection fails over HTTPS

Verify the nginx/ingress config includes WebSocket upgrade headers. For Compose, check `nginx/nginx.conf` has the `/socket.io/` location with `Upgrade` and `Connection` headers.

### OAuth callback fails

Update `GOOGLE_CALLBACK_URL` and `GITHUB_CALLBACK_URL` to use `https://` and register the HTTPS callback URL in your OAuth provider console.
