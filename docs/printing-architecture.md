# Printing Architecture

Sheikh Al Kar ERP uses server-created print jobs plus a local Windows Electron agent. Checkout creates the invoice, payments, kitchen order, and print jobs in one database transaction. Printing failures do not roll back paid invoices.

The default transport is secure HTTPS polling because the current app is standard Next.js route handlers and may be deployed on serverless infrastructure where persistent WebSocket connections are not reliable. A dedicated print gateway can later consume the same device-token authentication model.

Main models: `PrintDevice`, `PrintPairingCode`, `PrinterConfiguration`, `ProductPrinterRoute`, `CategoryPrinterRoute`, and `PrintJob`.
