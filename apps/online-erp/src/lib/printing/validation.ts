import { z } from "zod";

export const pairingCodeSchema = z.object({
  branchId: z.string().min(1),
});

export const pairDeviceSchema = z.object({
  pairingCode: z.string().min(6).max(16),
  deviceName: z.string().min(2).max(80),
  operatingSystem: z.string().max(120).optional(),
  appVersion: z.string().max(40).optional(),
});

export const printerConnectionTypeSchema = z.enum(["USB", "LAN", "SERIAL"]);

export const printerSchema = z.object({
  branchId: z.string().min(1),
  printDeviceId: z.string().min(1),
  printerType: z.enum(["CASHIER", "KITCHEN", "BAR", "LABEL", "REPORT"]),
  connectionType: printerConnectionTypeSchema.default("USB"),
  localPrinterName: z.string().min(1).max(180),
  displayName: z.string().min(1).max(120),
  ipAddress: z.string().max(120).nullable().optional(),
  port: z.number().int().min(1).max(65535).default(9100),
  paperWidth: z.enum(["W58", "W80", "A4", "CUSTOM"]).default("W80"),
  customWidthMm: z.number().int().positive().nullable().optional(),
  copies: z.number().int().min(1).max(5).default(1),
  autoPrint: z.boolean().default(true),
  enabled: z.boolean().default(true),
  openCashDrawer: z.boolean().default(false),
  cashDrawerPin: z.number().int().min(0).max(255).default(0),
  cashDrawerPulseOn: z.number().int().min(1).max(255).default(25),
  cashDrawerPulseOff: z.number().int().min(1).max(255).default(250),
  cashDrawerOpenBeforePrint: z.boolean().default(true),
}).superRefine((val, ctx) => {
  if (val.connectionType === "LAN") {
    if (!val.ipAddress || !val.ipAddress.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ipAddress"],
        message: "IP address is required for LAN printers",
      });
    }
  }
  if (val.paperWidth === "CUSTOM" && (!val.customWidthMm || val.customWidthMm <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customWidthMm"],
      message: "Custom width in mm is required when CUSTOM paper width is selected",
    });
  }
});

export const devicePrintersSchema = z.object({
  printers: z.array(z.object({
    name: z.string().min(1),
    displayName: z.string().optional(),
    isDefault: z.boolean().optional(),
    status: z.string().optional(),
  })).max(100),
});

export const jobFailSchema = z.object({
  errorCode: z.string().min(1).max(80),
  errorMessage: z.string().max(600).optional(),
});

export const cashDrawerTestSchema = z.object({
  command: z.enum(["OPEN_CASH_DRAWER"]),
  printerId: z.string().min(1),
});
