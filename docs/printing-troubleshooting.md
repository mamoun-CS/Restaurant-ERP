# Printing Troubleshooting

- No jobs print: confirm Nova Print Agent is paired, online, and has reported printers.
- Printer not found: refresh printers and verify the ERP configuration uses the exact Windows printer name.
- Pending jobs: confirm the device token was not disabled and the agent can reach the ERP URL.
- Duplicate jobs: the ERP idempotency key and local queue prevent automatic duplicate printing. Reprints create new linked jobs.
- Mock mode: saves HTML previews under the agent user data directory and does not print physically.
