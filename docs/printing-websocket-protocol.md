# Printing Transport

The implemented production-safe transport is HTTPS polling. The agent heartbeats every 30 seconds and polls pending jobs every few seconds. Jobs transition through `PENDING`, `SENT`, `PROCESSING`, `PRINTED`, or `FAILED`.

If a deployment adds a dedicated WebSocket gateway, authenticate with the same device ID and bearer token, send heartbeats every 30 seconds, and preserve the same job status endpoints as the source of truth.
