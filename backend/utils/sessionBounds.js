export function calculateSessionBounds(data, allowlist) {
  const bounds = {};
  for (const shot of data) {
    for (const [key, value] of Object.entries(shot)) {
      if (!allowlist.includes(key)) continue;
      if (!value || isNaN(parseFloat(value))) continue;
      const num = parseFloat(value);
      if (!(key in bounds)) {
        bounds[key] = { min: num, max: num };
      } else {
        bounds[key].min = Math.min(bounds[key].min, num);
        bounds[key].max = Math.max(bounds[key].max, num);
      }
    }
  }
  return bounds;
}
