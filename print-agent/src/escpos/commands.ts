import type { PaperWidth } from "../types.js";

export class EscPos {
  public static readonly INIT = Buffer.from([0x1b, 0x40]);
  public static readonly CUT_PARTIAL = Buffer.from([0x1d, 0x56, 0x42, 0x00]); // GS V 'B' 0
  public static readonly CUT_FULL = Buffer.from([0x1d, 0x56, 0x41, 0x00]); // GS V 'A' 0
  public static readonly FEED_3_LINES = Buffer.from([0x1b, 0x64, 0x03]);
  public static readonly FEED_5_LINES = Buffer.from([0x1b, 0x64, 0x05]);

  /**
   * Cash drawer kick: ESC p m t1 t2
   * @param pin 0 (pin 2 / drawer 1) or 1 (pin 5 / drawer 2)
   * @param pulseOn duration in ms (converted to 2ms units)
   * @param pulseOff duration in ms (converted to 2ms units)
   */
  public static cashDrawer(pin = 0, pulseOn = 25, pulseOff = 250): Buffer {
    const m = pin === 1 ? 1 : 0;
    const t1 = Math.min(255, Math.max(1, Math.round(pulseOn / 2)));
    const t2 = Math.min(255, Math.max(1, Math.round(pulseOff / 2)));
    return Buffer.from([0x1b, 0x70, m, t1, t2]);
  }

  /**
   * Resolves paper dot width based on PaperWidth enum and customWidthMm
   * 80mm paper standard printable width: 72mm = 576 dots @ 203 DPI (8 dots/mm)
   * 58mm paper standard printable width: 48mm = 384 dots @ 203 DPI (8 dots/mm)
   */
  public static resolveDotWidth(paperWidth?: PaperWidth, customWidthMm?: number | null): number {
    if (paperWidth === "W58") return 384;
    if (paperWidth === "W80") return 576;
    if (paperWidth === "A4") return 1680;
    if (paperWidth === "CUSTOM" && customWidthMm && customWidthMm > 0) {
      // Usable printable width is typically (paperWidthMm - 8mm) * 8 dots/mm
      const usableMm = Math.max(20, customWidthMm - 8);
      // Align to byte boundary (multiple of 8)
      return Math.floor((usableMm * 8) / 8) * 8;
    }
    return 576; // Default standard 80mm
  }
}
