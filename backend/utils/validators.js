import { createHttpError } from "./httpError.js";

export function assertUsername(username) {
  const normalized = String(username || "").trim();

  if (!normalized) {
    throw createHttpError(400, "Username is required.");
  }

  if (!/^[A-Za-z0-9_.-]{1,80}$/.test(normalized)) {
    throw createHttpError(400, "Username contains unsupported characters.");
  }

  return normalized;
}

export function assertOptionalUsername(username, label = "Username") {
  const normalized = String(username || "").trim();
  if (!normalized) return "";

  if (!/^[A-Za-z0-9_.-]{1,80}$/.test(normalized)) {
    throw createHttpError(400, `${label} contains unsupported characters.`);
  }

  return normalized;
}
