export function buildRequest(method, uri, headers = {}) {
  const lines = [`${method} ${uri} RTSP/1.0`];
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || value === null) continue;
    lines.push(`${key}: ${value}`);
  }
  lines.push("", "");
  return lines.join("\r\n");
}

export function parseRtspMessage(buffer) {
  if (!buffer.length) return null;
  if (buffer[0] === 0x24) {
    if (buffer.length < 4) return { need: 4 };
    const channel = buffer[1];
    const size = buffer.readUInt16BE(2);
    const total = 4 + size;
    if (buffer.length < total) return { need: total };
    return {
      interleaved: true,
      channel,
      packet: buffer.subarray(4, total),
      consumed: total,
    };
  }

  const headerEnd = indexOfCrlfCrlf(buffer);
  if (headerEnd === -1) return { need: buffer.length + 1 };
  const headerText = buffer.subarray(0, headerEnd).toString("utf8");
  const lines = headerText.split("\r\n");
  const statusLine = lines[0];
  const headers = {};
  for (const line of lines.slice(1)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    headers[line.slice(0, idx).toLowerCase()] = line.slice(idx + 1).trim();
  }
  const contentLength = Number(headers["content-length"] || 0);
  const total = headerEnd + 4 + contentLength;
  if (buffer.length < total) return { need: total };
  return {
    interleaved: false,
    statusLine,
    status: Number((statusLine.match(/RTSP\/1\.0\s+(\d+)/) || [])[1] || 0),
    headers,
    body: buffer.subarray(headerEnd + 4, total).toString("utf8"),
    consumed: total,
  };
}

function indexOfCrlfCrlf(buffer) {
  for (let i = 0; i < buffer.length - 3; i++) {
    if (
      buffer[i] === 13 &&
      buffer[i + 1] === 10 &&
      buffer[i + 2] === 13 &&
      buffer[i + 3] === 10
    ) {
      return i;
    }
  }
  return -1;
}

export function sessionId(sessionHeader) {
  if (!sessionHeader) return null;
  return sessionHeader.split(";")[0].trim();
}

export function sessionTimeoutMs(sessionHeader) {
  const match = String(sessionHeader || "").match(/timeout=(\d+)/i);
  if (!match) return 30000;
  return Math.max(5000, Number(match[1]) * 1000 - 10000);
}
