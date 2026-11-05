# Security Model

## Existing application

The web application signs an eight-hour `erp_session` JWT using `AUTH_SECRET`, hashes passwords with bcrypt, rate-limits login attempts, and tracks account lockout fields. The database stores only `passwordHash`; there is no cashier PIN verifier or desktop device enrollment/authentication flow. Current discount campaign routes are admin restricted, but invoice creation accepts a caller-supplied discount amount without enforcing campaign/cashier/supervisor limits. `POST /api/sync/cloud` currently has no authentication check and must not be treated as a public desktop endpoint.

## Desktop controls required before production rollout

- Electron: context isolation on, Node integration off, sandbox renderer, strict navigation/window policy, restrictive CSP, signed installer, dependency updates, and explicit IPC allowlist with runtime validation.
- Credentials: device refresh secret in Windows Credential Manager/DPAPI-backed store; renderer never handles long-lived credentials. Do not put secrets in `.env` bundled with the app or `NEXT_PUBLIC_*` variables.
- Local data: Windows user data directory with restrictive ACLs; protect credential/verifier material using OS-backed encryption where possible. SQLite itself is not encrypted by default; assess SQLCipher only if at-rest threat requirements justify its deployment cost. Back up before upgrades and avoid logging customer/payment secrets.
- API: TLS, device-scoped credentials and revocation, short-lived tokens, input schemas, branch/device authorization, rate limits, request correlation IDs, replay-safe idempotency, safe error responses, and audit events. Never accept arbitrary SQL or trust a renderer-supplied role.
- Cashier access: the desktop foundation uses a versioned Node `scrypt` PIN verifier (`scrypt-v1`), constant-time comparison, persisted five-attempt lockout, credential expiry, and a 15-minute inactivity timeout. Cloud provisioning must supply the verifier and signed permission snapshot before a cashier can sign in. Supervisor reauthentication for sensitive actions remains to be implemented.
- Payments: do not store card PAN/CVV. Retain only allowed processor references and last four digits if the payment provider contract permits it.

Offline access necessarily delays enforcement of cloud disablement and permission changes. Mitigate with short offline credential/policy validity, restricted actions, and a clear last-sync timestamp; document the residual risk for the business owner.

## Production blockers

Before pilot, require external review of device enrollment/token rotation, offline secret storage, local database backup/restore, signed update chain, discount authorization, API authorization, and cloud idempotency uniqueness. Do not expose the current unauthenticated cloud sync route to the internet.
