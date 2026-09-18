export function parseSdp(text) {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const session = { attributes: {}, raw: text };
  const medias = [];
  let current = session;

  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq !== 1) continue;
    const type = line[0];
    const value = line.slice(2);

    if (type === "m") {
      const [kind, port, proto, ...fmts] = value.split(/\s+/);
      current = {
        kind,
        port: Number(port),
        proto,
        payloads: fmts,
        attributes: {},
        rtpmap: {},
        fmtp: {},
        control: null,
      };
      medias.push(current);
      continue;
    }

    if (type === "a") {
      const colon = value.indexOf(":");
      const key = colon === -1 ? value : value.slice(0, colon);
      const val = colon === -1 ? true : value.slice(colon + 1);
      current.attributes[key] = val;

      if (key === "control") current.control = val;
      if (key === "rtpmap" && typeof val === "string") {
        const [pt, rest] = val.split(/\s+/);
        const [codec, clock, channels] = (rest || "").split("/");
        current.rtpmap[pt] = {
          codec: (codec || "").toUpperCase(),
          clock: Number(clock) || 0,
          channels: channels ? Number(channels) : undefined,
        };
      }
      if (key === "fmtp" && typeof val === "string") {
        const space = val.indexOf(" ");
        const pt = space === -1 ? val : val.slice(0, space);
        const params = {};
        const body = space === -1 ? "" : val.slice(space + 1);
        for (const part of body.split(";")) {
          const trimmed = part.trim();
          if (!trimmed) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx === -1) params[trimmed.toLowerCase()] = true;
          else params[trimmed.slice(0, eqIdx).trim().toLowerCase()] = trimmed.slice(eqIdx + 1).trim();
        }
        current.fmtp[pt] = params;
      }
      continue;
    }

    if (type === "c") current.connection = value;
    if (type === "s") session.name = value;
    if (type === "o") session.origin = value;
  }

  return { session, medias };
}

export function codecFamily(name) {
  const codec = String(name || "").toUpperCase();
  if (codec === "H264" || codec === "AVC") return "h264";
  if (codec === "H265" || codec === "HEVC" || codec === "HVC1" || codec === "HEV1") return "h265";
  if (codec === "JPEG" || codec === "MJPEG" || codec === "MPJPEG") return "jpeg";
  return "unknown";
}

export function audioFamily(name) {
  const codec = String(name || "").toUpperCase();
  if (codec === "MPEG4-GENERIC" || codec === "MP4A-LATM" || codec === "AAC") return "aac";
  if (codec === "OPUS") return "opus";
  if (codec === "PCMU" || codec === "PCMA" || codec.startsWith("G7") || codec === "L16") return "legacy";
  return "unknown";
}

export function pickAudioTrack(sdp) {
  if (!sdp?.medias) return null;
  for (const media of sdp.medias) {
    if (media.kind !== "audio") continue;
    for (const pt of media.payloads) {
      const map = media.rtpmap[pt] || { codec: "UNKNOWN", clock: 8000 };
      const fmtp = media.fmtp[pt] || {};
      return {
        payloadType: Number(pt),
        clockRate: map.clock || 8000,
        channels: map.channels || 1,
        sdpCodec: map.codec,
        family: audioFamily(map.codec),
        control: media.control,
        sizeLength: Number(fmtp.sizelength || 13),
        indexLength: Number(fmtp.indexlength || 3),
        config: typeof fmtp.config === "string" ? fmtp.config : null,
        fmtp,
      };
    }
  }
  return null;
}

export function pickVideoTrack(sdp) {
  for (const media of sdp.medias) {
    if (media.kind !== "video") continue;
    for (const pt of media.payloads) {
      const map = media.rtpmap[pt] || (Number(pt) === 26
        ? { codec: "JPEG", clock: 90000 }
        : { codec: "UNKNOWN", clock: 90000 });
      const fmtp = media.fmtp[pt] || {};
      const family = codecFamily(map.codec);
      const b64 = (key) => {
        const value = fmtp[key];
        if (!value || value === true) return null;
        try {
          return Buffer.from(String(value), "base64");
        } catch {
          return null;
        }
      };
      const sets = String(fmtp["sprop-parameter-sets"] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        media,
        payloadType: Number(pt),
        clockRate: map.clock || 90000,
        family,
        sdpCodec: map.codec,
        packetizationMode: Number(fmtp["packetization-mode"] || 0),
        profileLevelId: String(fmtp["profile-level-id"] || fmtp["profile-id"] || ""),
        donl: Number(fmtp["sprop-max-don-diff"] || 0) > 0,
        sps: family === "h264" && sets[0] ? Buffer.from(sets[0], "base64") : b64("sprop-sps"),
        pps: family === "h264" && sets[1] ? Buffer.from(sets[1], "base64") : b64("sprop-pps"),
        vps: b64("sprop-vps"),
        control: media.control,
        fmtp,
      };
    }
  }
  return null;
}

export function pickH264Video(sdp) {
  const track = pickVideoTrack(sdp);
  return track?.family === "h264" ? track : null;
}

export function resolveControlUrl(contentBase, requestUrl, control) {
  if (!control) return requestUrl.replace(/\/?$/, "/");
  if (/^rtsp:\/\//i.test(control)) return control;
  const base = (contentBase || requestUrl).replace(/\/?$/, "/");
  if (control === "*") return base;
  return new URL(control, base).toString();
}
