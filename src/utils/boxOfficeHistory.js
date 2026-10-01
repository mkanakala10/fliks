const DAY = 86400000;
const timestamp = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return NaN;
  const value = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === date ? value : NaN;
};

export async function fetchBoxOfficeHistory(signal) {
  const response = await fetch(`${import.meta.env.BASE_URL}data/box-office/history.json`, { signal });
  if (!response.ok) throw new Error('Unable to load box-office history.');
  const records = await response.json();
  if (!Array.isArray(records)) throw new Error('Invalid box-office history.');
  return records.filter((record) => Number.isInteger(record.movieId) && record.currency === 'INR' && record.unit === 'crore' && Array.isArray(record.daily));
}

export function buildBoxOfficeSeries(record) {
  const start = timestamp(record.releaseDate);
  if (!Number.isFinite(start)) return [];
  const dates = new Map();
  for (const entry of record.daily) {
    const time = timestamp(entry.date);
    if (!Number.isFinite(time) || time < start || time > start + DAY * 730) continue;
    // Last report for a date wins, including a withdrawn/unknown value.
    dates.set(time, Number.isFinite(entry.amount) && entry.amount >= 0 ? entry.amount : null);
  }
  if (!dates.size) return [];
  const end = Math.max(...dates.keys());
  const points = [];
  let total = 0;
  let complete = true;
  for (let time = start; time <= end; time += DAY) {
    const daily = dates.get(time) ?? null;
    const previous = points.at(-1)?.daily;
    if (daily === null) complete = false;
    else total = Math.round((total + daily) * 100) / 100;
    points.push({ date: new Date(time).toISOString().slice(0, 10), day: (time - start) / DAY + 1, daily,
      cumulative: complete ? total : null,
      change: daily !== null && previous > 0 ? (daily - previous) / previous * 100 : null });
  }
  return points;
}
