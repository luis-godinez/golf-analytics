import db from "./db.js";

export const allowlist = [
  "Club Speed", "Attack Angle", "Club Path", "Club Face", "Face to Path",
  "Ball Speed", "Smash Factor", "Launch Angle", "Launch Direction", "Backspin",
  "Sidespin", "Spin Rate", "Spin Axis", "Apex Height", "Carry Distance",
  "Carry Deviation Angle", "Carry Deviation Distance", "Total Distance",
  "Total Deviation Angle", "Total Deviation Distance"
];

export async function computeGlobalStats() {
  await db.read();
  const sessions = db.data.sessions || [];
  const bounds = {};
  const availableClubs = new Set();

  for (const session of sessions) {
    for (const entry of session.data || []) {
      if (entry["Club Type"]) {
        availableClubs.add(entry["Club Type"]);
      }
      for (const [key, value] of Object.entries(entry)) {
        if (!allowlist.includes(key)) continue;
        const num = parseFloat(value);
        if (isNaN(num)) continue;
        if (!(key in bounds)) {
          bounds[key] = { min: num, max: num };
        } else {
          bounds[key].min = Math.min(bounds[key].min, num);
          bounds[key].max = Math.max(bounds[key].max, num);
        }
      }
    }
  }
  return {
    bounds,
    availableClubs: Array.from(availableClubs)
  };
}
