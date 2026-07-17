# Contributing

This is a private restaurant ERP project. Use these recommended conventions for changes.

## Workflow

1. Create a short branch name, such as `feature/cash-report-pdf` or `fix/mobile-pos-cart`.
2. Keep changes scoped to the feature or bug.
3. Reuse existing components, CSS tokens, API patterns, and Prisma conventions.
4. Update seed data when schema changes need local defaults.
5. Update documentation when workflows, routes, or environment variables change.

## Checks

Run before submitting changes:

```bash
npm run lint
npm run build
```

If Prisma schema changes:

```bash
npm run db:generate
```

## Database Rules

- Review schema changes before applying them to shared databases.
- Do not use destructive reset commands on shared or production data.
- Store financial values with `Decimal` fields, not floating-point fields.

## Security

- Do not commit `.env` or secrets.
- Keep authentication, permissions, and financial calculations server-side.
- Add audit log entries for sensitive financial actions.
