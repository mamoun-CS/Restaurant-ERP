export type PrinterConnectionType = "USB" | "LAN" | "SERIAL";

export type PaperWidth = "W58" | "W80" | "A4" | "CUSTOM";

export type JobType =
  | "CUSTOMER_RECEIPT"
  | "KITCHEN_TICKET"
  | "BAR_TICKET"
  | "SHIFT_CLOSE_REPORT"
  | "LABEL"
  | "TEST_PRINT"
  | "OPEN_CASH_DRAWER";

export type ContentType = "HTML" | "ESC_POS";

export type JobStatus =
  | "PENDING"
  | "SENT"
  | "PROCESSING"
  | "PRINTED"
  | "FAILED"
  | "CANCELLED";

export interface AgentConfig {
  erpUrl: string;
  deviceId?: string;
  deviceCode?: string;
  token?: string;
  branchId?: string;
  deviceName?: string;
  heartbeatIntervalMs?: number;
  fallbackPollIntervalMs?: number;
}

export interface PrinterConfigDto {
  id: string;
  branchId: string;
  printDeviceId: string;
  printerType: string;
  connectionType?: PrinterConnectionType;
  localPrinterName: string;
  displayName: string;
  ipAddress?: string | null;
  port?: number | null;
  paperWidth: PaperWidth;
  customWidthMm?: number | null;
  copies: number;
  autoPrint: boolean;
  enabled: boolean;
  openCashDrawer: boolean;
  cashDrawerPin: number;
  cashDrawerPulseOn: number;
  cashDrawerPulseOff: number;
  cashDrawerOpenBeforePrint: boolean;
}

export interface PrintJobDto {
  id: string;
  branchId: string;
  printDeviceId?: string | null;
  printerConfigurationId?: string | null;
  printerConfiguration?: PrinterConfigDto | null;
  jobType: JobType;
  contentType: ContentType;
  content: string;
  copies: number;
  paperWidth: PaperWidth;
  customWidthMm?: number | null;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  openCashDrawer: boolean;
  idempotencyKey: string;
  createdAt: string | Date;
}

export interface DetectedPrinter {
  name: string;
  displayName?: string;
  isDefault?: boolean;
  status?: string;
}

export interface CheckItem {
  key: string;
  title: string;
  status: "pass" | "warn" | "fail";
  details: string;
  fix?: string;
}
