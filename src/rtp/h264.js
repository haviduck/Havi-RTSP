const NAL_STAP_A = 24;
const NAL_FU_A = 28;

export function createH264Depayloader() {
  let fragments = [];
  let fuIndicator = 0;
  let fuType = 0;

  function resetFu() {
    fragments = [];
    fuIndicator = 0;
    fuType = 0;
  }

  return function depay(payload) {
    if (!payload.length) return [];
    const nalType = payload[0] & 0x1f;

    if (nalType > 0 && nalType < 24) {
      resetFu();
      return [Buffer.from(payload)];
    }

    if (nalType === NAL_STAP_A) {
      resetFu();
      return splitStapA(payload);
    }

    if (nalType === NAL_FU_A) {
      if (payload.length < 2) return [];
      const indicator = payload[0];
      const header = payload[1];
      const start = Boolean(header & 0x80);
      const end = Boolean(header & 0x40);
      const type = header & 0x1f;

      if (start) {
        fragments = [payload.subarray(2)];
        fuIndicator = indicator;
        fuType = type;
      } else if (fragments.length) {
        fragments.push(payload.subarray(2));
      } else {
        return [];
      }

      if (!end) return [];

      const nalu = Buffer.concat([
        Buffer.from([(fuIndicator & 0xe0) | fuType]),
        ...fragments,
      ]);
      resetFu();
      return [nalu];
    }

    resetFu();
    return [];
  };
}

function splitStapA(payload) {
  const nals = [];
  let offset = 1;
  while (offset + 2 <= payload.length) {
    const size = payload.readUInt16BE(offset);
    offset += 2;
    if (offset + size > payload.length) break;
    nals.push(Buffer.from(payload.subarray(offset, offset + size)));
    offset += size;
  }
  return nals;
}

export function nalType(nal) {
  return nal[0] & 0x1f;
}

export function isIdr(nal) {
  return nalType(nal) === 5;
}

export function isSps(nal) {
  return nalType(nal) === 7;
}

export function isPps(nal) {
  return nalType(nal) === 8;
}

export function isVcl(nal) {
  const type = nalType(nal);
  return type >= 1 && type <= 5;
}
