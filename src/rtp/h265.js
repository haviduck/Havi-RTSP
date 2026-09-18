export const HEVC_VPS = 32;
export const HEVC_SPS = 33;
export const HEVC_PPS = 34;
export const HEVC_AUD = 35;
export const HEVC_FU = 49;
export const HEVC_AP = 48;

export function hevcNalType(nal) {
  if (!nal?.length) return -1;
  return (nal[0] >> 1) & 0x3f;
}

export function isHevcKeyframe(nal) {
  const type = hevcNalType(nal);
  return type >= 16 && type <= 21;
}

export function isHevcVps(nal) {
  return hevcNalType(nal) === HEVC_VPS;
}

export function isHevcSps(nal) {
  return hevcNalType(nal) === HEVC_SPS;
}

export function isHevcPps(nal) {
  return hevcNalType(nal) === HEVC_PPS;
}

export function isHevcVcl(nal) {
  const type = hevcNalType(nal);
  return type >= 0 && type <= 31;
}

export function createH265Depayloader({ donl = false } = {}) {
  let fragments = [];
  let payloadHdr = null;

  function resetFu() {
    fragments = [];
    payloadHdr = null;
  }

  return function depay(payload) {
    if (payload.length < 2) return [];
    const type = (payload[0] >> 1) & 0x3f;

    if (type === HEVC_FU) {
      let offset = 2;
      if (donl) offset += 2;
      if (payload.length <= offset) return [];
      const fuHeader = payload[offset];
      const start = Boolean(fuHeader & 0x80);
      const end = Boolean(fuHeader & 0x40);
      const fuType = fuHeader & 0x3f;
      const body = payload.subarray(offset + 1);

      if (start) {
        payloadHdr = Buffer.from([(payload[0] & 0x81) | (fuType << 1), payload[1]]);
        fragments = [body];
      } else if (fragments.length) {
        fragments.push(body);
      } else {
        return [];
      }

      if (!end) return [];
      const nalu = Buffer.concat([payloadHdr, ...fragments]);
      resetFu();
      return [nalu];
    }

    resetFu();

    if (type === HEVC_AP) {
      return splitAggregation(payload, donl);
    }

    if (type < 48) {
      return [Buffer.from(payload)];
    }

    return [];
  };
}

function splitAggregation(payload, donl) {
  const nals = [];
  let offset = 2 + (donl ? 2 : 0);
  while (offset + 2 <= payload.length) {
    const size = payload.readUInt16BE(offset);
    offset += 2;
    if (offset + size > payload.length) break;
    nals.push(Buffer.from(payload.subarray(offset, offset + size)));
    offset += size;
  }
  return nals;
}
