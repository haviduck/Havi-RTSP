export class BitReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.bit = 0;
  }

  u(n) {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const byte = this.buffer[this.bit >> 3] || 0;
      v = v * 2 + ((byte >> (7 - (this.bit & 7))) & 1);
      this.bit++;
    }
    return v;
  }

  ue() {
    let zeros = 0;
    while (this.u(1) === 0) zeros++;
    return zeros === 0 ? 0 : (1 << zeros) - 1 + this.u(zeros);
  }

  se() {
    const v = this.ue();
    return (v & 1) ? (v + 1) >> 1 : -(v >> 1);
  }
}

export function unescapeEmulationPrevention(data) {
  const out = [];
  for (let i = 0; i < data.length; i++) {
    if (i + 2 < data.length && data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 3) {
      out.push(0, 0);
      i += 2;
      continue;
    }
    out.push(data[i]);
  }
  return Buffer.from(out);
}

export function stripStartCode(nal) {
  if (nal.length >= 4 && nal[0] === 0 && nal[1] === 0 && nal[2] === 0 && nal[3] === 1) {
    return nal.subarray(4);
  }
  if (nal.length >= 3 && nal[0] === 0 && nal[1] === 0 && nal[2] === 1) {
    return nal.subarray(3);
  }
  return nal;
}

export function sameNal(a, b) {
  return Boolean(a && b && a.length === b.length && a.equals(b));
}
