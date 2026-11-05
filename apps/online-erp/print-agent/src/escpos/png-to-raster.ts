import zlib from "node:zlib";

export interface DecodedImage {
  width: number;
  height: number;
  data: Buffer;
  channels: number;
}

export function decodePng(pngBuffer: Buffer): DecodedImage {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!pngBuffer.subarray(0, 8).equals(signature)) {
    throw new Error("Invalid PNG signature");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 6;
  const idatChunks: Buffer[] = [];

  while (offset < pngBuffer.length) {
    const length = pngBuffer.readUInt32BE(offset);
    const type = pngBuffer.toString("ascii", offset + 4, offset + 8);
    offset += 8;

    if (type === "IHDR") {
      width = pngBuffer.readUInt32BE(offset);
      height = pngBuffer.readUInt32BE(offset + 4);
      colorType = pngBuffer.readUInt8(offset + 9);
    } else if (type === "IDAT") {
      idatChunks.push(pngBuffer.subarray(offset, offset + length));
    } else if (type === "IEND") {
      break;
    }

    offset += length + 4;
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 4;
  const bytesPerPixel = channels;
  const scanlineWidth = width * bytesPerPixel;
  const rawData = Buffer.alloc(width * height * channels);

  let inOffset = 0;
  let outOffset = 0;
  const prevLine = Buffer.alloc(scanlineWidth);
  const currentLine = Buffer.alloc(scanlineWidth);

  for (let y = 0; y < height; y++) {
    const filter = decompressed.readUInt8(inOffset++);

    for (let x = 0; x < scanlineWidth; x++) {
      const raw = decompressed.readUInt8(inOffset++);
      const a = x >= bytesPerPixel ? currentLine[x - bytesPerPixel] : 0;
      const b = prevLine[x];
      const c = x >= bytesPerPixel ? prevLine[x - bytesPerPixel] : 0;

      let val = 0;
      if (filter === 0) {
        val = raw;
      } else if (filter === 1) {
        val = (raw + a) & 0xff;
      } else if (filter === 2) {
        val = (raw + b) & 0xff;
      } else if (filter === 3) {
        val = (raw + Math.floor((a + b) / 2)) & 0xff;
      } else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        val = (raw + pr) & 0xff;
      } else {
        val = raw;
      }

      currentLine[x] = val;
      rawData[outOffset++] = val;
    }

    currentLine.copy(prevLine);
  }

  return { width, height, data: rawData, channels };
}

export function imageToEscPosRaster(image: DecodedImage, threshold = 180): Buffer {
  const { width, height, data, channels } = image;
  const widthBytes = Math.ceil(width / 8);
  const rasterBuffer = Buffer.alloc(widthBytes * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelOffset = (y * width + x) * channels;
      let r = 255;
      let g = 255;
      let b = 255;
      let a = 255;

      if (channels === 1) {
        r = g = b = data[pixelOffset];
      } else if (channels === 3) {
        r = data[pixelOffset];
        g = data[pixelOffset + 1];
        b = data[pixelOffset + 2];
      } else if (channels === 4) {
        r = data[pixelOffset];
        g = data[pixelOffset + 1];
        b = data[pixelOffset + 2];
        a = data[pixelOffset + 3];
      }

      if (a < 128) {
        continue;
      }

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < threshold) {
        const byteIndex = y * widthBytes + Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);
        rasterBuffer[byteIndex] |= 1 << bitIndex;
      }
    }
  }

  // Header: GS v 0 0 xL xH yL yH
  const header = Buffer.from([
    0x1d,
    0x76,
    0x30,
    0x00,
    widthBytes & 0xff,
    (widthBytes >> 8) & 0xff,
    height & 0xff,
    (height >> 8) & 0xff,
  ]);

  return Buffer.concat([header, rasterBuffer]);
}
