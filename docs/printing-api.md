# Printing API

Admin/session endpoints:

- `POST /api/printing/pairing-codes`
- `GET /api/printing/devices`
- `PATCH /api/printing/devices/[id]`
- `DELETE /api/printing/devices/[id]`
- `GET /api/printing/printers`
- `POST /api/printing/printers`
- `PATCH /api/printing/printers/[id]`
- `DELETE /api/printing/printers/[id]`
- `GET /api/printing/jobs`
- `POST /api/printing/jobs/[id]/retry`
- `POST /api/printing/jobs/[id]/reprint`
- `POST /api/printing/jobs/[id]/cancel`

Device endpoints use `Authorization: Bearer <device token>` and `x-print-device-id`.

- `POST /api/printing/pair`
- `POST /api/printing/device/heartbeat`
- `POST /api/printing/device/printers`
- `GET /api/printing/device/jobs`
- `POST /api/printing/device/jobs/[id]/processing`
- `POST /api/printing/device/jobs/[id]/complete`
- `POST /api/printing/device/jobs/[id]/fail`
