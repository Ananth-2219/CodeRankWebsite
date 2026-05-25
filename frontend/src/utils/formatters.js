export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

export function joinBadges(badges = []) {
  return badges.length ? badges.join(", ") : "-";
}
