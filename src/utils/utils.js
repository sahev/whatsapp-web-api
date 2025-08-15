export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function validateBrazilianNumber(id) {
  if (!/^\d{10,13}$/.test(id)) return false;
  const ddd = parseInt(id.slice(2, 4), 10);
  if (ddd <= 27 && id.length === 13) return true;
  if (ddd >= 28 && ddd <= 99 && id.length === 12) return true;
  return false;
}