import { BitReader, stripStartCode, unescapeEmulationPrevention } from "./bits.js";

export function parseHevcSps(nal) {
  const raw = stripStartCode(nal);
  const rbsp = unescapeEmulationPrevention(raw.subarray(2));
  const bits = new BitReader(rbsp);

  bits.u(4); // sps_video_parameter_set_id
  const maxSubLayersMinus1 = bits.u(3);
  bits.u(1); // sps_temporal_id_nesting_flag
  const ptl = parseProfileTierLevel(bits, maxSubLayersMinus1);
  bits.ue(); // sps_seq_parameter_set_id
  const chromaFormatIdc = bits.ue();
  if (chromaFormatIdc === 3) bits.u(1);
  let width = bits.ue();
  let height = bits.ue();
  if (bits.u(1)) {
    const left = bits.ue();
    const right = bits.ue();
    const top = bits.ue();
    const bottom = bits.ue();
    const subX = chromaFormatIdc === 1 || chromaFormatIdc === 2 ? 2 : 1;
    const subY = chromaFormatIdc === 1 ? 2 : 1;
    width -= subX * (left + right);
    height -= subY * (top + bottom);
  }
  const bitDepthLumaMinus8 = bits.ue();
  const bitDepthChromaMinus8 = bits.ue();

  return {
    width,
    height,
    chromaFormatIdc,
    bitDepthLumaMinus8,
    bitDepthChromaMinus8,
    ...ptl,
    codec: hevcCodecString(ptl),
  };
}

export function hevcCodecString(ptl) {
  const space = ptl.profileSpace ? `${ptl.profileSpace}` : "";
  const compat = (ptl.compatibilityFlags >>> 0).toString(16).replace(/0+$/, "") || "0";
  const tier = ptl.tierFlag ? "H" : "L";
  const constraints = constraintHex(ptl.constraintFlags);
  return `hvc1.${space}${ptl.profileIdc}.${compat}.${tier}${ptl.levelIdc}.${constraints}`;
}

export function buildHvcC({ vps, sps, pps }) {
  const spsNal = stripStartCode(sps);
  const ppsNal = stripStartCode(pps);
  const vpsNal = vps ? stripStartCode(vps) : null;
  const info = parseHevcSps(spsNal);

  const arrays = [];
  if (vpsNal) arrays.push(nalArray(32, [vpsNal]));
  arrays.push(nalArray(33, [spsNal]));
  arrays.push(nalArray(34, [ppsNal]));

  const header = Buffer.alloc(23);
  let o = 0;
  header[o++] = 1;
  header[o++] = ((info.profileSpace & 3) << 6) | ((info.tierFlag & 1) << 5) | (info.profileIdc & 0x1f);
  header.writeUInt32BE(info.compatibilityFlags >>> 0, o);
  o += 4;
  const c = info.constraintFlags;
  header[o++] = Number((c >> 40n) & 0xffn);
  header[o++] = Number((c >> 32n) & 0xffn);
  header[o++] = Number((c >> 24n) & 0xffn);
  header[o++] = Number((c >> 16n) & 0xffn);
  header[o++] = Number((c >> 8n) & 0xffn);
  header[o++] = Number(c & 0xffn);
  header[o++] = info.levelIdc;
  header.writeUInt16BE(0xf000, o);
  o += 2;
  header[o++] = 0xfc;
  header[o++] = 0xfc | (info.chromaFormatIdc & 3);
  header[o++] = 0xf8 | (info.bitDepthLumaMinus8 & 7);
  header[o++] = 0xf8 | (info.bitDepthChromaMinus8 & 7);
  header.writeUInt16BE(0, o);
  o += 2;
  header[o++] = 0x03; // 1 temporal layer, nested, lengthSizeMinusOne=3
  header[o++] = arrays.length;

  return { hvcC: Buffer.concat([header, ...arrays]), info };
}

function nalArray(type, nals) {
  const pieces = [Buffer.from([0x80 | (type & 0x3f)])];
  const count = Buffer.alloc(2);
  count.writeUInt16BE(nals.length);
  pieces.push(count);
  for (const nal of nals) {
    const len = Buffer.alloc(2);
    len.writeUInt16BE(nal.length);
    pieces.push(len, nal);
  }
  return Buffer.concat(pieces);
}

function parseProfileTierLevel(bits, maxSubLayersMinus1) {
  const profileSpace = bits.u(2);
  const tierFlag = bits.u(1);
  const profileIdc = bits.u(5);
  const compatibilityFlags = bits.u(32);
  const constraintFlags = BigInt(bits.u(24)) << 24n | BigInt(bits.u(24));
  const levelIdc = bits.u(8);
  const profilePresent = [];
  const levelPresent = [];
  for (let i = 0; i < maxSubLayersMinus1; i++) {
    profilePresent[i] = bits.u(1);
    levelPresent[i] = bits.u(1);
  }
  if (maxSubLayersMinus1 > 0) {
    for (let i = maxSubLayersMinus1; i < 8; i++) bits.u(2);
  }
  for (let i = 0; i < maxSubLayersMinus1; i++) {
    if (profilePresent[i]) {
      bits.u(88);
    }
    if (levelPresent[i]) bits.u(8);
  }
  return { profileSpace, tierFlag, profileIdc, compatibilityFlags, constraintFlags, levelIdc };
}

function constraintHex(flags) {
  const bytes = [];
  for (let i = 5; i >= 0; i--) bytes.push(Number((flags >> BigInt(i * 8)) & 0xffn));
  while (bytes.length > 1 && bytes[bytes.length - 1] === 0) bytes.pop();
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
