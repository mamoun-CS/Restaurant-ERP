import { EscPos } from "./commands.js";

export function htmlToPlainTextEscPos(html: string): Buffer {
  // Strip CSS, head, scripts
  let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");

  // Format table rows and divs into linebreaks
  text = text.replace(/<\/tr>/gi, "\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<td[^>]*>(.*?)<\/td>/gi, "$1  ");
  text = text.replace(/<th[^>]*>(.*?)<\/th>/gi, "$1  ");

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, "");

  // Unescape HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Normalize blank lines
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l, idx, arr) => l.length > 0 || (idx > 0 && arr[idx - 1].length > 0));

  const cleanText = lines.join("\n") + "\n\n";
  const bodyBuffer = Buffer.from(cleanText, "utf8");

  return Buffer.concat([EscPos.INIT, bodyBuffer, EscPos.FEED_3_LINES, EscPos.CUT_PARTIAL]);
}
