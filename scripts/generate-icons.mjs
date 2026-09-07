// Rasterizes the app icon (relay node topology) to PNG at the sizes the PWA
// manifest requires. Pure Node implementation so no native image tooling is
// needed in CI or dev containers.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const BG = [15, 23, 42]; // slate-900
const HUB = [56, 189, 248]; // sky-400
const NODE = [129, 140, 248]; // indigo-400
const EDGE = [71, 85, 105]; // slate-600

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let k = 0; k < 8; k++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  // One filter byte (0 = None) per scanline.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const px = (x, y, [r, g, b]) => {
    const i = (y * size + x) * 4;
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
    rgba[i + 3] = 255;
  };

  const s = size / 512; // geometry authored on a 512 grid
  const hub = { x: 256 * s, y: 256 * s, r: 52 * s };
  const nodes = [
    { x: 128 * s, y: 128 * s },
    { x: 384 * s, y: 128 * s },
    { x: 128 * s, y: 384 * s },
    { x: 384 * s, y: 384 * s },
  ];
  const nodeR = 36 * s;
  const edgeW = 9 * s;

  const distToSegment = (px_, py_, a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(
      0,
      Math.min(1, ((px_ - a.x) * dx + (py_ - a.y) * dy) / (dx * dx + dy * dy)),
    );
    return Math.hypot(px_ - (a.x + t * dx), py_ - (a.y + t * dy));
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = BG;
      for (const n of nodes) {
        if (distToSegment(x, y, n, hub) < edgeW) color = EDGE;
      }
      for (const n of nodes) {
        if (Math.hypot(x - n.x, y - n.y) < nodeR) color = NODE;
      }
      if (Math.hypot(x - hub.x, y - hub.y) < hub.r) color = HUB;
      px(x, y, color);
    }
  }
  return encodePng(size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of [192, 512]) {
  const file = join(OUT_DIR, `pwa-${size}x${size}.png`);
  writeFileSync(file, drawIcon(size));
  console.log(`wrote ${file}`);
}
