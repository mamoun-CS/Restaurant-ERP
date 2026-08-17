// ===============================
// Printer Configuration
// Edit these values only
// ===============================

export const PRINT_CONFIG = {
  // Keep this synchronized with --receipt-width and the literal @page size in src/app/globals.css.
  PAPER_SIZE: "60mm", // Examples: 58mm, 60mm, 72mm, 80mm

  AUTO_PRINT_DELAY: 500, // milliseconds

  ENABLE_AUTO_PRINT: true,

  REMOVE_PRINT_FLAG_AFTER_PRINT: true,

  PRINT_BACKGROUND: true,
} as const;
