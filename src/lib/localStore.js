export function readLocal(key, fallback = null) {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // In restricted browsers preferences remain available for this session.
  }
}
