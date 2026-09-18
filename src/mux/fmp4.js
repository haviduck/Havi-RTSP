import { sameNal } from "./bits.js";
import { buildAvcC } from "./sps.js";
import { buildHvcC } from "./hevc.js";
import { isIdr, isPps, isSps, isVcl } from "../rtp/h264.js";
import { isHevcPps, isHevcSps, isHevcVcl, isHevcVps } from "../rtp/h265.js";

export class Fmp4Muxer {
  constructor({ family = "h264", vps, sps, pps, timescale = 90000 } = {}) {
    this.family = family;
    this.timescale = timescale;
    this.sequence = 1;
    this.baseTime = 0n;
    this.lastTimestamp = null;
    this.defaultDuration = 3000;
    this.ready = false;
    this.vps = vps || null;
    this.sps = sps || null;
    this.pps = pps || null;
    this.info = null;
    this.decoderConfig = null;
    if (sps && pps && (family === "h264" || vps || family === "h265")) {
      this.#configure();
    }
  }

  #configure() {
    if (this.family === "h265") {
      if (!this.sps || !this.pps) return;
      const { hvcC, info } = buildHvcC({ vps: this.vps, sps: this.sps, pps: this.pps });
      this.decoderConfig = hvcC;
      this.info = { ...info, family: "h265" };
    } else {
      if (!this.sps || !this.pps) return;
      const { avcC, info } = buildAvcC(this.sps, this.pps);
      this.decoderConfig = avcC;
      this.info = { ...info, family: "h264" };
    }
    this.ready = true;
  }

  updateParameterSets(nals) {
    let changed = false;
    for (const nal of nals) {
      if (this.family === "h265") {
        if (isHevcVps(nal) && !sameNal(nal, this.vps)) { this.vps = nal; changed = true; }
        if (isHevcSps(nal) && !sameNal(nal, this.sps)) { this.sps = nal; changed = true; }
        if (isHevcPps(nal) && !sameNal(nal, this.pps)) { this.pps = nal; changed = true; }
      } else {
        if (isSps(nal) && !sameNal(nal, this.sps)) { this.sps = nal; changed = true; }
        if (isPps(nal) && !sameNal(nal, this.pps)) { this.pps = nal; changed = true; }
      }
    }
    if ((changed || !this.ready) && this.sps && this.pps) {
      const before = this.ready;
      this.#configure();
      return this.ready && (!before || changed);
    }
    return false;
  }

  initSegment() {
    if (!this.ready) throw new Error("Parameter sets required before init segment");
    const { width, height, codec } = this.info;
    const hevc = this.family === "h265";
    const brands = hevc
      ? [str("iso5"), u32(512), str("iso5"), str("iso6"), str("mp41"), str("hvc1")]
      : [str("iso5"), u32(512), str("iso5"), str("iso6"), str("mp41")];
    return Buffer.concat([
      box("ftyp", ...brands),
      box(
        "moov",
        fullBox("mvhd", 0, 0, u32(0), u32(0), u32(this.timescale), u32(0), u32(0x00010000), u16(0x0100), u16(0), u32(0), u32(0), matrix(), zeros(24), u32(2)),
        box(
          "trak",
          fullBox(
            "tkhd",
            0,
            0x07,
            u32(0),
            u32(0),
            u32(1),
            u32(0),
            u32(0),
            u32(0),
            u32(0),
            u16(0),
            u16(0),
            u16(0),
            u16(0),
            matrix(),
            u32(width << 16),
            u32(height << 16),
          ),
          box(
            "mdia",
            fullBox("mdhd", 0, 0, u32(0), u32(0), u32(this.timescale), u32(0), u16(0x55c4), u16(0)),
            fullBox("hdlr", 0, 0, u32(0), str("vide"), u32(0), u32(0), u32(0), str("Havi Video\0")),
            box(
              "minf",
              fullBox("vmhd", 0, 1, u16(0), u16(0), u16(0), u16(0)),
              box("dinf", fullBox("dref", 0, 0, u32(1), fullBox("url ", 0, 1))),
              box(
                "stbl",
                fullBox(
                  "stsd",
                  0,
                  0,
                  u32(1),
                  hevc
                    ? visualSampleEntry("hvc1", width, height, box("hvcC", this.decoderConfig))
                    : visualSampleEntry("avc1", width, height, box("avcC", this.decoderConfig)),
                ),
                fullBox("stts", 0, 0, u32(0)),
                fullBox("stsc", 0, 0, u32(0)),
                fullBox("stsz", 0, 0, u32(0), u32(0)),
                fullBox("stco", 0, 0, u32(0)),
              ),
            ),
          ),
        ),
        box("mvex", fullBox("trex", 0, 0, u32(1), u32(1), u32(0), u32(0), u32(0))),
      ),
    ]);
  }

  mediaFragment(accessUnit) {
    if (!this.ready) return null;
    const sample = this.family === "h265"
      ? toHvccSample(accessUnit.nals, this.vps, this.sps, this.pps, accessUnit.keyframe)
      : toAvccSample(accessUnit.nals, this.sps, this.pps, accessUnit.keyframe);
    if (!sample) return null;

    let duration = this.defaultDuration;
    if (this.lastTimestamp !== null) {
      duration = unsignedDelta(accessUnit.timestamp, this.lastTimestamp);
      if (duration <= 0 || duration > this.timescale) duration = this.defaultDuration;
      else this.defaultDuration = duration;
    }
    this.lastTimestamp = accessUnit.timestamp;

    const decodeTime = this.baseTime;
    this.baseTime += BigInt(duration);

    const sampleFlags = accessUnit.keyframe ? 0x02000000 : 0x01010000;
    const trunFlags = 0x000001 | 0x000100 | 0x000200 | 0x000400;
    const mfhd = fullBox("mfhd", 0, 0, u32(this.sequence++));
    const tfhd = fullBox("tfhd", 0, 0x020000, u32(1));
    const tfdt = fullBox("tfdt", 1, 0, u64(decodeTime));
    const trun = fullBox(
      "trun",
      0,
      trunFlags,
      u32(1),
      u32(0),
      u32(duration),
      u32(sample.length),
      u32(sampleFlags),
    );
    const moofSize = 8 + mfhd.length + 8 + tfhd.length + tfdt.length + trun.length;
    trun.writeUInt32BE(moofSize + 8, 16);
    const moof = box("moof", mfhd, box("traf", tfhd, tfdt, trun));
    return Buffer.concat([moof, box("mdat", sample)]);
  }
}

function toAvccSample(nals, sps, pps, keyframe) {
  const pieces = [];
  const filtered = nals.filter((nal) => nal.length && (nal[0] & 0x1f) !== 12);
  const hasSps = filtered.some(isSps);
  const hasPps = filtered.some(isPps);
  if (keyframe && sps && !hasSps) pieces.push(lengthPrefixed(sps));
  if (keyframe && pps && !hasPps) pieces.push(lengthPrefixed(pps));
  let vcl = 0;
  for (const nal of filtered) {
    if (isVcl(nal) || isSps(nal) || isPps(nal) || (nal[0] & 0x1f) === 6) {
      pieces.push(lengthPrefixed(nal));
      if (isVcl(nal)) vcl++;
    }
  }
  if (!vcl) return null;
  return Buffer.concat(pieces);
}

function toHvccSample(nals, vps, sps, pps, keyframe) {
  const pieces = [];
  const filtered = nals.filter((nal) => nal.length >= 2);
  if (keyframe && vps && !filtered.some(isHevcVps)) pieces.push(lengthPrefixed(vps));
  if (keyframe && sps && !filtered.some(isHevcSps)) pieces.push(lengthPrefixed(sps));
  if (keyframe && pps && !filtered.some(isHevcPps)) pieces.push(lengthPrefixed(pps));
  let vcl = 0;
  for (const nal of filtered) {
    const type = (nal[0] >> 1) & 0x3f;
    if (type === 35 || type === 38) continue;
    if (isHevcVcl(nal) || isHevcVps(nal) || isHevcSps(nal) || isHevcPps(nal) || type === 39 || type === 40) {
      pieces.push(lengthPrefixed(nal));
      if (isHevcVcl(nal)) vcl++;
    }
  }
  if (!vcl) return null;
  return Buffer.concat(pieces);
}

function lengthPrefixed(nal) {
  const header = Buffer.alloc(4);
  header.writeUInt32BE(nal.length);
  return Buffer.concat([header, nal]);
}

function visualSampleEntry(type, width, height, configBox) {
  return box(
    type,
    zeros(6),
    u16(1),
    u16(0),
    u16(0),
    u32(0),
    u32(0),
    u32(0),
    u16(width),
    u16(height),
    u32(0x00480000),
    u32(0x00480000),
    u32(0),
    u16(1),
    compressorName(),
    u16(0x0018),
    Buffer.from([0xff, 0xff]),
    configBox,
  );
}

function box(type, ...parts) {
  const body = Buffer.concat(parts.flat().filter(Boolean));
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + body.length, 0);
  header.write(type, 4, "ascii");
  return Buffer.concat([header, body]);
}

function fullBox(type, version, flags, ...parts) {
  const vf = Buffer.alloc(4);
  vf.writeUInt32BE(((version & 0xff) << 24) | (flags & 0xffffff));
  return box(type, vf, ...parts);
}

function str(value) {
  return Buffer.from(value, "ascii");
}

function u16(value) {
  const b = Buffer.alloc(2);
  b.writeUInt16BE(value);
  return b;
}

function u32(value) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(value >>> 0);
  return b;
}

function u64(value) {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(value));
  return b;
}

function zeros(n) {
  return Buffer.alloc(n);
}

function matrix() {
  return Buffer.concat([
    u32(0x00010000), u32(0), u32(0),
    u32(0), u32(0x00010000), u32(0),
    u32(0), u32(0), u32(0x40000000),
  ]);
}

function compressorName() {
  const b = Buffer.alloc(32);
  const name = "Havi-RTSP";
  b[0] = name.length;
  b.write(name, 1, "ascii");
  return b;
}

function unsignedDelta(now, prev) {
  return (now - prev) >>> 0;
}
