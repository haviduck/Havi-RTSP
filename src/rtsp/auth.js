import { md5Hex, randomHex } from "../util/md5.js";

export function credentialsFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.username) return null;
    return {
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password || ""),
    };
  } catch {
    return null;
  }
}

export function publicRtspUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.username = "";
    parsed.password = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

export function parseWwwAuthenticate(header) {
  if (!header) return null;
  const scheme = header.split(/\s+/, 1)[0];
  const params = {};
  const re = /(\w+)=(?:"([^"]*)"|([^,\s]+))/g;
  let match;
  while ((match = re.exec(header))) {
    params[match[1].toLowerCase()] = match[2] ?? match[3];
  }
  return { scheme: scheme.toLowerCase(), params };
}

export function authorize({ method, uri, header, credentials, nc = 1 }) {
  if (!credentials) return null;
  const parsed = parseWwwAuthenticate(header);
  if (!parsed) return null;
  if (parsed.scheme === "basic") {
    const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");
    return `Basic ${token}`;
  }
  if (parsed.scheme !== "digest") return null;

  const realm = parsed.params.realm || "";
  const nonce = parsed.params.nonce || "";
  const qop = (parsed.params.qop || "").split(",")[0].trim();
  const opaque = parsed.params.opaque;
  const algorithm = parsed.params.algorithm || "MD5";
  const cnonce = randomHex(8);
  const ncStr = nc.toString(16).padStart(8, "0");
  const ha1 = md5(`${credentials.username}:${realm}:${credentials.password}`);
  const ha2 = md5(`${method}:${uri}`);
  const response = qop
    ? md5(`${ha1}:${nonce}:${ncStr}:${cnonce}:${qop}:${ha2}`)
    : md5(`${ha1}:${nonce}:${ha2}`);

  const parts = [
    `Digest username="${credentials.username}"`,
    `realm="${realm}"`,
    `nonce="${nonce}"`,
    `uri="${uri}"`,
    `response="${response}"`,
    `algorithm=${algorithm}`,
  ];
  if (qop) parts.push(`qop=${qop}`, `nc=${ncStr}`, `cnonce="${cnonce}"`);
  if (opaque) parts.push(`opaque="${opaque}"`);
  return parts.join(", ");
}

function md5(value) {
  return md5Hex(value);
}
