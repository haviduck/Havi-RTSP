// Target/allowlist helpers shared by the Node and Deno hosts.

export function splitTarget(value) {
  const i = String(value).lastIndexOf(":");
  if (i <= 0) throw new Error("target must be host:port");
  return { host: value.slice(0, i), port: Number(value.slice(i + 1)) };
}

export function isLoopback(host) {
  return host === "127.0.0.1" || host === "localhost" || host === "::1";
}

export function normalizeAllow(allow) {
  if (!allow) return null;
  if (allow instanceof Set) return allow;
  const set = new Set(String(allow).split(",").map((s) => s.trim()).filter(Boolean));
  return set.size ? set : null;
}

export function checkTarget(target, { allow, fixed, requireAllow }) {
  if (!target.host || !Number.isFinite(target.port) || !target.port) return "host and port required";
  if (requireAllow && !allow && !fixed) return "allow list required when not bound to localhost";
  if (allow && !allow.has(`${target.host}:${target.port}`)) return "target not allowed";
  return null;
}

export function targetFromQuery(url, fixed) {
  return fixed || {
    host: url.searchParams.get("host"),
    port: Number(url.searchParams.get("port") || 554),
  };
}
