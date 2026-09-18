import { BitReader, stripStartCode, unescapeEmulationPrevention } from "./bits.js";

export function parseSps(nal) {
  const rbsp = unescapeEmulationPrevention(nal.subarray(1));
  const bits = new BitReader(rbsp);

  const profileIdc = bits.u(8);
  const profileCompatibility = bits.u(8);
  const levelIdc = bits.u(8);
  bits.ue(); // seq_parameter_set_id

  let chromaFormatIdc = 1;
  if ([100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135].includes(profileIdc)) {
    chromaFormatIdc = bits.ue();
    if (chromaFormatIdc === 3) bits.u(1);
    bits.ue(); // bit_depth_luma_minus8
    bits.ue(); // bit_depth_chroma_minus8
    bits.u(1); // qpprime_y_zero_transform_bypass_flag
    if (bits.u(1)) {
      const count = chromaFormatIdc !== 3 ? 8 : 12;
      for (let i = 0; i < count; i++) {
        if (bits.u(1)) skipScalingList(bits, i < 6 ? 16 : 64);
      }
    }
  }

  bits.ue(); // log2_max_frame_num_minus4
  const pocType = bits.ue();
  if (pocType === 0) {
    bits.ue();
  } else if (pocType === 1) {
    bits.u(1);
    bits.se();
    bits.se();
    const n = bits.ue();
    for (let i = 0; i < n; i++) bits.se();
  }

  bits.ue(); // max_num_ref_frames
  bits.u(1); // gaps_in_frame_num_value_allowed_flag
  const picWidthInMbsMinus1 = bits.ue();
  const picHeightInMapUnitsMinus1 = bits.ue();
  const frameMbsOnlyFlag = bits.u(1);
  if (!frameMbsOnlyFlag) bits.u(1);

  bits.u(1); // direct_8x8_inference_flag
  let cropLeft = 0;
  let cropRight = 0;
  let cropTop = 0;
  let cropBottom = 0;
  if (bits.u(1)) {
    cropLeft = bits.ue();
    cropRight = bits.ue();
    cropTop = bits.ue();
    cropBottom = bits.ue();
  }

  const cropUnitX = chromaFormatIdc === 0 ? 1 : 2;
  const cropUnitY = (chromaFormatIdc === 0 ? 1 : 2) * (2 - frameMbsOnlyFlag);
  const width = (picWidthInMbsMinus1 + 1) * 16 - cropUnitX * (cropLeft + cropRight);
  const height =
    (2 - frameMbsOnlyFlag) * (picHeightInMapUnitsMinus1 + 1) * 16 -
    cropUnitY * (cropTop + cropBottom);

  return {
    profileIdc,
    profileCompatibility,
    levelIdc,
    width,
    height,
    codec: codecString(profileIdc, profileCompatibility, levelIdc),
  };
}

export function codecString(profileIdc, compat, levelIdc) {
  return `avc1.${hex2(profileIdc)}${hex2(compat)}${hex2(levelIdc)}`;
}

export function buildAvcC(sps, pps) {
  const spsNal = stripStartCode(sps);
  const ppsNal = stripStartCode(pps);
  const info = parseSps(spsNal);
  const buf = Buffer.alloc(11 + spsNal.length + ppsNal.length);
  let o = 0;
  buf[o++] = 1;
  buf[o++] = info.profileIdc;
  buf[o++] = info.profileCompatibility;
  buf[o++] = info.levelIdc;
  buf[o++] = 0xff;
  buf[o++] = 0xe1;
  buf.writeUInt16BE(spsNal.length, o);
  o += 2;
  spsNal.copy(buf, o);
  o += spsNal.length;
  buf[o++] = 1;
  buf.writeUInt16BE(ppsNal.length, o);
  o += 2;
  ppsNal.copy(buf, o);
  return { avcC: buf, info };
}

function hex2(n) {
  return n.toString(16).padStart(2, "0");
}

function skipScalingList(bits, size) {
  let lastScale = 8;
  let nextScale = 8;
  for (let i = 0; i < size; i++) {
    if (nextScale !== 0) {
      const delta = bits.se();
      nextScale = (lastScale + delta + 256) % 256;
    }
    lastScale = nextScale === 0 ? lastScale : nextScale;
  }
}
