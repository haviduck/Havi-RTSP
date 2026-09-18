const LUMA_Q = [
  16, 11, 12, 14, 12, 10, 16, 14, 13, 14, 18, 17, 16, 19, 24, 40,
  26, 24, 22, 22, 24, 49, 35, 37, 29, 40, 58, 51, 61, 60, 57, 51,
  56, 55, 64, 72, 92, 78, 64, 68, 87, 69, 55, 56, 80, 109, 81, 87,
  95, 98, 103, 104, 103, 62, 77, 113, 121, 112, 100, 120, 92, 101, 103, 99,
];

const CHROMA_Q = [
  17, 18, 18, 24, 21, 24, 47, 26, 26, 47, 99, 66, 56, 66, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
];

const LUM_DC_LEN = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const LUM_DC_SYM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const LUM_AC_LEN = [0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
const LUM_AC_SYM = [
  0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
  0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
  0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
  0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
  0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
  0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
  0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
  0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
  0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
  0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
  0xf9, 0xfa,
];
const CH_DC_LEN = [0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
const CH_DC_SYM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const CH_AC_LEN = [0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
const CH_AC_SYM = [
  0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
  0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91, 0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0,
  0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26,
  0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
  0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
  0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
  0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5,
  0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
  0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda,
  0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
  0xf9, 0xfa,
];

export function createJpegDepayloader() {
  let raw = [];
  let rawTs = null;
  let rfc = null;

  return function depay(rtp) {
    const payload = rtp?.payload;
    if (!payload?.length) return null;
    if (raw.length || (payload[0] === 0xff && payload[1] === 0xd8)) {
      rfc = null;
      return depayRaw(rtp, payload);
    }
    return depayRfc(rtp, payload);
  };

  function depayRaw(rtp, payload) {
    if (rawTs !== null && rawTs !== rtp.timestamp && raw.length) {
      const previous = finishRaw();
      rawTs = rtp.timestamp;
      raw = [payload];
      if (rtp.marker || hasEoi(payload)) {
        const current = finishRaw();
        return current || previous;
      }
      return previous;
    }
    rawTs = rtp.timestamp;
    raw.push(payload);
    if (rtp.marker || hasEoi(payload)) return finishRaw();
    return null;
  }

  function finishRaw() {
    const data = Buffer.concat(raw);
    raw = [];
    rawTs = null;
    return toFrame(data);
  }

  function depayRfc(rtp, payload) {
    if (payload.length < 8) return null;
    const fragmentOffset = (payload[1] << 16) | (payload[2] << 8) | payload[3];
    const type = payload[4];
    const q = payload[5];
    const width = payload[6] * 8;
    const height = payload[7] * 8;
    let o = 8;
    let dri = 0;
    if (type >= 64) {
      if (payload.length < o + 4) return null;
      dri = (payload[o] << 8) | payload[o + 1];
      o += 4;
    }
    let qTable = null;
    if (fragmentOffset === 0 && q > 127) {
      if (payload.length < o + 4) return null;
      const length = (payload[o + 2] << 8) | payload[o + 3];
      o += 4;
      if (payload.length < o + length) return null;
      qTable = Buffer.from(payload.subarray(o, o + length));
      o += length;
    }
    const scan = payload.subarray(o);
    if (fragmentOffset === 0) {
      rfc = { type, q, width, height, dri, qTable, parts: [scan], next: scan.length };
    } else if (!rfc || fragmentOffset !== rfc.next) {
      rfc = null;
      return null;
    } else {
      rfc.parts.push(scan);
      rfc.next += scan.length;
    }
    if (!rtp.marker || !rfc) return null;
    const scanData = Buffer.concat(rfc.parts);
    const jpeg = wrapRfcJpeg(rfc, scanData);
    rfc = null;
    return toFrame(jpeg);
  }
}

function wrapRfcJpeg(meta, scan) {
  const type = meta.type & 0x3f;
  const tables = quantTables(meta.q, meta.qTable);
  const header = jpegHeader({
    type,
    width: meta.width,
    height: meta.height,
    dri: meta.dri,
    luma: tables.luma,
    chroma: tables.chroma,
  });
  const end = hasEoi(scan) ? scan : Buffer.concat([scan, Buffer.from([0xff, 0xd9])]);
  return Buffer.concat([header, end]);
}

function quantTables(q, supplied) {
  if (supplied && supplied.length >= 64) {
    const luma = supplied.subarray(0, 64);
    const chroma = supplied.length >= 128 ? supplied.subarray(64, 128) : luma;
    return { luma: Buffer.from(luma), chroma: Buffer.from(chroma) };
  }
  let factor = q;
  if (factor < 1) factor = 1;
  if (factor > 99) factor = 99;
  const scale = factor < 50 ? Math.floor(5000 / factor) : 200 - factor * 2;
  const scaleTable = (base) => {
    const out = Buffer.alloc(64);
    for (let i = 0; i < 64; i++) {
      const v = Math.floor((base[i] * scale + 50) / 100);
      out[i] = v < 1 ? 1 : v > 255 ? 255 : v;
    }
    return out;
  };
  return { luma: scaleTable(LUMA_Q), chroma: scaleTable(CHROMA_Q) };
}

function jpegHeader({ type, width, height, dri, luma, chroma }) {
  const parts = [Buffer.from([0xff, 0xd8])];
  parts.push(dqt(0, luma), dqt(1, chroma));
  if (dri) parts.push(driBox(dri));
  parts.push(sof(type, width, height));
  parts.push(dht(0x00, LUM_DC_LEN, LUM_DC_SYM));
  parts.push(dht(0x10, LUM_AC_LEN, LUM_AC_SYM));
  parts.push(dht(0x01, CH_DC_LEN, CH_DC_SYM));
  parts.push(dht(0x11, CH_AC_LEN, CH_AC_SYM));
  parts.push(sos());
  return Buffer.concat(parts);
}

function dqt(id, table) {
  const body = Buffer.alloc(67);
  body[0] = 0xff;
  body[1] = 0xdb;
  body.writeUInt16BE(67 - 2, 2);
  body[4] = id;
  table.copy(body, 5);
  return body;
}

function driBox(dri) {
  const b = Buffer.alloc(6);
  b[0] = 0xff;
  b[1] = 0xdd;
  b.writeUInt16BE(4, 2);
  b.writeUInt16BE(dri, 4);
  return b;
}

function sof(type, width, height) {
  const hv = type === 0 ? 0x21 : 0x22;
  const b = Buffer.alloc(19);
  b[0] = 0xff;
  b[1] = 0xc0;
  b.writeUInt16BE(17, 2);
  b[4] = 8;
  b.writeUInt16BE(height, 5);
  b.writeUInt16BE(width, 7);
  b[9] = 3;
  b[10] = 1; b[11] = hv; b[12] = 0;
  b[13] = 2; b[14] = 0x11; b[15] = 1;
  b[16] = 3; b[17] = 0x11; b[18] = 1;
  return b;
}

function dht(cls, lengths, symbols) {
  const body = Buffer.alloc(5 + 16 + symbols.length);
  body[0] = 0xff;
  body[1] = 0xc4;
  body.writeUInt16BE(body.length - 2, 2);
  body[4] = cls;
  Buffer.from(lengths).copy(body, 5);
  Buffer.from(symbols).copy(body, 21);
  return body;
}

function sos() {
  return Buffer.from([
    0xff, 0xda, 0x00, 0x0c, 0x03,
    0x01, 0x00, 0x02, 0x11, 0x03, 0x11,
    0x00, 0x3f, 0x00,
  ]);
}

function hasEoi(buf) {
  return buf.length >= 2 && buf[buf.length - 2] === 0xff && buf[buf.length - 1] === 0xd9;
}

export function jpegSize(buf) {
  if (!buf || buf.length < 10) return { width: 0, height: 0 };
  let i = 2;
  while (i + 8 < buf.length) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      i += 2;
      continue;
    }
    const len = (buf[i + 2] << 8) | buf[i + 3];
    if (marker === 0xc0 || marker === 0xc2) {
      return {
        height: (buf[i + 5] << 8) | buf[i + 6],
        width: (buf[i + 7] << 8) | buf[i + 8],
      };
    }
    i += 2 + len;
  }
  return { width: 0, height: 0 };
}

function toFrame(data) {
  if (!data?.length || data[0] !== 0xff || data[1] !== 0xd8) return null;
  const size = jpegSize(data);
  return { data, width: size.width, height: size.height };
}
