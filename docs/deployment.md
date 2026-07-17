# Deployment

This project does not include a hosting-provider configuration, Dockerfile, or process manager file. Deploy it as a standard Next.js application with PostgreSQL.

## Build

```bash
npm install
npm run db:generate
npm run build
```

## Runtime

Set production environment variables:

```text
DATABASE_URL=postgresql://...
AUTH_SECRET=...
APP_URL=https://your-domain.example
SMTP_HOST=...
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM_NAME=Sheikh Al Kar
SMTP_FROM_EMAIL=no-reply@your-domain.example
```

Start:

```bash
npm run start
```

## Database Changes

Use reviewed Prisma migrations for database changes.

Development:

```bash
npm run db:migrate
```

Production:

```bash
npm run db:deploy
```

Do not use `prisma db push` for production schema changes.

## Security Checklist

- Use HTTPS.
- Use a strong `AUTH_SECRET` with at least 32 characters. Production startup fails when it is missing or too short.
- Keep `.env` out of version control.
- Restrict database network access.
- Back up PostgreSQL before schema changes.
- Monitor audit logs for financial changes.
- Use Redis or another shared persistent store for production rate limiting. The included in-memory limiter is only suitable for a single development/runtime process.
