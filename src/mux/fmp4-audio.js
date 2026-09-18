export class AacFmp4Muxer {
  constructor({ sampleRate = 44100, channels = 1, asc } = {}) {
    this.sampleRate = sampleRate;
    this.channels = channels;
    this.timescale = sampleRate;
    this.asc = asc && asc.length ? Buffer.from(asc) : audioSpecificConfig(sampleRate, channels);
    this.codec = "mp4a.40.2";
    this.sequence = 1;
    this.baseTime = 0n;
    this.frameDuration = 1024;
  }

  initSegment() {
    const rate = this.sampleRate;
    const ch = this.channels;
    return Buffer.concat([
      box("ftyp", str("iso5"), u32(512), str("iso5"), str("iso6"), str("mp41")),
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
            u16(0x0100),
            u16(0),
            matrix(),
            u32(0),
            u32(0),
          ),
          box(
            "mdia",
            fullBox("mdhd", 0, 0, u32(0), u32(0), u32(this.timescale), u32(0), u16(0x55c4), u16(0)),
            fullBox("hdlr", 0, 0, u32(0), str("soun"), u32(0), u32(0), u32(0), str("Havi Audio\0")),
            box(
              "minf",
              fullBox("smhd", 0, 0, u16(0), u16(0)),
              box("dinf", fullBox("dref", 0, 0, u32(1), fullBox("url ", 0, 1))),
              box(
                "stbl",
                fullBox("stsd", 0, 0, u32(1), audioSampleEntry(rate, ch, this.asc)),
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

  mediaFragment(payload, duration = this.frameDuration) {
    if (!payload?.length) return null;
    const sample = Buffer.from(payload);
    const decodeTime = this.baseTime;
    this.baseTime += BigInt(duration);

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
      u32(0x02000000),
    );
    const moofSize = 8 + mfhd.length + 8 + tfhd.length + tfdt.length + trun.length;
    trun.writeUInt32BE(moofSize + 8, 16);
    return Buffer.concat([box("moof", mfhd, box("traf", tfhd, tfdt, trun)), box("mdat", sample)]);
  }
}

export function audioSpecificConfig(sampleRate, channels) {
  const table = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000];
  const freq = table.indexOf(sampleRate);
  const fi = freq >= 0 ? freq : 4;
  const ch = Math.max(1, Math.min(channels || 1, 7));
  const b1 = (2 << 3) | (fi >> 1);
  const b2 = ((fi & 1) << 7) | (ch << 3);
  return Buffer.from([b1, b2]);
}

function audioSampleEntry(sampleRate, channels, asc) {
  return box(
    "mp4a",
    zeros(6),
    u16(1),
    zeros(8),
    u16(channels),
    u16(16),
    u16(0),
    u16(0),
    u32((sampleRate & 0xffff) << 16),
    esdsBox(asc),
  );
}

function esdsBox(asc) {
  const dsi = desc(0x05, Buffer.from(asc));
  const decoder = desc(0x04, Buffer.concat([
    Buffer.from([0x40, 0x15]),
    Buffer.from([0x00, 0x01, 0x77]),
    u32(128000),
    u32(64000),
    dsi,
  ]));
  const sl = desc(0x06, Buffer.from([0x02]));
  const es = desc(0x03, Buffer.concat([u16(1), Buffer.from([0x00]), decoder, sl]));
  return fullBox("esds", 0, 0, es);
}

function desc(tag, body) {
  return Buffer.concat([Buffer.from([tag, 0x80, 0x80, 0x80, body.length]), body]);
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
