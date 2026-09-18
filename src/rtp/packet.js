export function parseRtp(packet) {
  if (packet.length < 12) return null;
  const b0 = packet[0];
  const b1 = packet[1];
  const version = b0 >> 6;
  if (version !== 2) return null;
  const padding = Boolean(b0 & 0x20);
  const extension = Boolean(b0 & 0x10);
  const csrcCount = b0 & 0x0f;
  const marker = Boolean(b1 & 0x80);
  const payloadType = b1 & 0x7f;
  const sequence = packet.readUInt16BE(2);
  const timestamp = packet.readUInt32BE(4);
  const ssrc = packet.readUInt32BE(8);

  let offset = 12 + csrcCount * 4;
  if (offset > packet.length) return null;

  if (extension) {
    if (offset + 4 > packet.length) return null;
    const extLen = packet.readUInt16BE(offset + 2);
    offset += 4 + extLen * 4;
    if (offset > packet.length) return null;
  }

  let end = packet.length;
  if (padding) {
    const pad = packet[packet.length - 1];
    end -= pad;
    if (end < offset) return null;
  }

  return {
    marker,
    payloadType,
    sequence,
    timestamp,
    ssrc,
    payload: packet.subarray(offset, end),
  };
}
