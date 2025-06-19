import { allowlist } from "./aggregateSessions.js";
import db from "./db.js";

export async function computeProgressionSummary(metric) {

  if (!allowlist.includes(metric)) {
    throw new Error("Invalid metric");
  }

  // Extract sessions from db
  await db.read();
  const sessions = db.data.sessions;

  // Extract units
  const units = sessions?.[0]?.units?.[metric] || "";

  const allClubs = new Set();
  for (const session of sessions) {
    for (const shot of session.data) {
      if (shot["Club Type"]) {
        allClubs.add(shot["Club Type"]);
      }
    }
  }

  // Map to hold club -> array of { date, value }
  const clubDataMap = new Map();

  for (const club of allClubs) {
    clubDataMap.set(club, []);
  }

  for (const session of sessions) {
    // Get the session name
    const sessionName = session.filename;
    if (!sessionName) continue;
    
    // Aggregate metric values by club for this session
    const clubMetrics = {};

    for (const shot of session.data) {
      const club = shot["Club Type"];
      const value = shot[metric];
      if (value === undefined || value === null) continue;

      if (!clubMetrics[club]) {
        clubMetrics[club] = [];
      }
      clubMetrics[club].push(value);
    }

    // Compute average metric per club for this session and add to clubDataMap
    for (const [club, values] of Object.entries(clubMetrics)) {
      const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
      if (numericValues.length === 0) continue;
      const avgValue = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      clubDataMap.get(club).push({ date: sessionName, value: avgValue });
    }
  }

  // Convert map to array of objects
  const result = [];
  for (const [club, data] of clubDataMap.entries()) {
    result.push({ club, data });
  }

  return { series: result, units };
}
