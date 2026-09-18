export function createAacDepayloader({ sizeLength = 13, indexLength = 3 } = {}) {
  const sizeBits = Number(sizeLength) || 0;
  const indexBits = Number(indexLength) || 0;

  return function depay(payload) {
    if (!payload?.length) return [];
    if (sizeBits <= 0) return [Buffer.from(payload)];
    if (payload.length < 2) return [];

    const headerBits = (payload[0] << 8) | payload[1];
    const headerBytes = Math.ceil(headerBits / 8);
    const headerStart = 2;
    const body = payload.subarray(headerStart + headerBytes);
    if (!body.length) return [];

    const sizes = [];
    let bit = 0;
    while (bit + sizeBits <= headerBits) {
      sizes.push(readBits(payload, headerStart, bit, sizeBits));
      bit += sizeBits + indexBits;
    }
    if (!sizes.length) return [body];

    const aus = [];
    let offset = 0;
    for (const size of sizes) {
      if (size <= 0 || offset + size > body.length) break;
      aus.push(body.subarray(offset, offset + size));
      offset += size;
    }
    return aus;
  };
}

function readBits(buf, byteOffset, bitOffset, count) {
  let value = 0;
  for (let i = 0; i < count; i++) {
    const abs = byteOffset * 8 + bitOffset + i;
    const bit = (buf[abs >> 3] >> (7 - (abs & 7))) & 1;
    value = (value << 1) | bit;
  }
  return value;
}
