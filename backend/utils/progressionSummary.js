import { allowlist } from "./aggregateSessions.js";
import db from "./db.js";

export async function computeProgressionSummary(metric, clubFilter = []) {
  if (!allowlist.includes(metric)) {
    throw new Error("Invalid metric");
  }

  await db.read();
  const sessions = db.data.sessions;
  const shots = db.data.shots;

  // Find a units value from session metadata by checking for the key presence directly
  let units = "";
  for (const session of sessions) {
    if (session.units && Object.prototype.hasOwnProperty.call(session.units, metric)) {
      units = session.units[metric];
      break;
    }
  }

  // Map club types to progression data points
  const clubDataMap = new Map();

  for (const session of sessions) {
    const sessionShots = shots.filter(shot => shot.sessionId === session.id);

    // Group shots by club type within this session
    const clubMetrics = {};

    for (const shot of sessionShots) {
      const club = shot["Club Type"];
      const value = shot[metric];

      if (!club || (clubFilter.length > 0 && !clubFilter.includes(club))) continue;
      if (value === undefined || value === null) continue;

      clubMetrics[club] ??= [];
      clubMetrics[club].push(parseFloat(value));
    }

    // Compute average metric per club for this session
    for (const [club, values] of Object.entries(clubMetrics)) {
      const numericValues = values.filter(v => !isNaN(v));
      if (numericValues.length === 0) continue;

      const avgValue = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;

      if (!clubDataMap.has(club)) {
        clubDataMap.set(club, []);
      }
      clubDataMap.get(club).push({ date: session.date, value: avgValue });
    }
  }

  // Convert map to array
  const result = [];
  for (const [club, data] of clubDataMap.entries()) {
    // Sort each club's progression data by date ascending
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    result.push({ club, data });
  }

  return { series: result, units };
}
