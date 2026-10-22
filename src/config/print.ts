// ===============================
// Printer Configuration
// Edit these values only
// ===============================

export const PRINT_CONFIG = {
  // Follows PrinterConfiguration.paperWidth (default W80 / 80mm)
  PAPER_SIZE: "80mm", // Examples: 58mm, 80mm, custom

  AUTO_PRINT_DELAY: 500, // milliseconds

  ENABLE_AUTO_PRINT: true,

  REMOVE_PRINT_FLAG_AFTER_PRINT: true,

  PRINT_BACKGROUND: true,
} as const;
