export function backoffMs(attempt, { base = 600, max = 12000 } = {}) {
  const exp = Math.min(max, base * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * 250);
  return exp + jitter;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
