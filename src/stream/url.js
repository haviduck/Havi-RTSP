export function normalizeStreamUrl(url) {
  const value = String(url || "").trim();
  if (/^rtsp:\/\//i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return value;
  throw new Error("URL must start with rtsp:// or http://");
}

export function isHttpUrl(url) {
  return /^https?:\/\//i.test(String(url || "").trim());
}
