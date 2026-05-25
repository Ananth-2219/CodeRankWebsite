export function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

export function normalizeNumber(value) {
  if (value === null || value === undefined) return 0;

  const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function roundScore(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function badgeScore(badge = "") {
  if (/platinum badge/i.test(badge)) return 200;
  if (/gold badge/i.test(badge)) return 100;
  if (/silver badge/i.test(badge)) return 50;
  if (/bronze badge/i.test(badge)) return 20;
  return 0;
}

export function rankBonus(rank = "") {
  const normalized = String(rank).toLowerCase();

  if (normalized.includes("grandmaster")) return 300;
  if (normalized.includes("candidate master")) return 100;
  if (normalized.includes("master")) return 150;
  if (normalized.includes("expert")) return 50;

  return 0;
}
