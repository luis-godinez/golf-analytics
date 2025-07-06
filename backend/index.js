import express from "express";
import cors from "cors";
import sessionsRouter from "./routes/sessions.js";
import fs from "fs";
import path from "path";
import { parseGarminR50Csv } from "./utils/parseCsv.js";
import db, { initDB } from "./utils/db.js";
import { v4 as uuidv4 } from "uuid";
import { calculateFileHash } from "./utils/fileHash.js";
import { boundsAllowlist } from "./constants/allowlist.js";
import { calculateSessionBounds } from "./utils/sessionBounds.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/sessions", sessionsRouter);

(async () => {
  const dbPath = path.join(process.cwd(), "db.json");
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  await initDB();
  await db.read();

  // Explicitly reset in-memory data before seeding
  db.data.sessions = [];
  db.data.shots = [];

  const csvDir = path.join(process.cwd(), "CSVs");
  const filenames = fs.readdirSync(csvDir).filter(file => file.endsWith(".csv"));
  console.log("Seeding db:");
  console.log("files:", filenames);

  // Show signatures before loop
  console.log("Existing signatures before loop:", db.data.sessions.map(s => s.signature));

  for (const filename of filenames) {
    const filePath = path.join(csvDir, filename);
    const result = await parseGarminR50Csv(filePath);

    if (!result.data || result.data.length === 0) {
      console.log(`Skipping empty data for ${filename}`);
      continue;
    }

    const signature = calculateFileHash(filePath);

    console.log(`\n➡️ Processing: ${filename}`);
    console.log(`🔑 File hash: ${signature}`);

    const existingSession = db.data.sessions.find(session => session.signature === signature);
    if (existingSession) {
      console.log(`⚠️ Skipping: Duplicate session of ${existingSession.date}.`);
      continue;
    }

    const sessionId = uuidv4();
    const firstShotTimestamp = result.fileDate;

    const sessionBounds = calculateSessionBounds(result.data, boundsAllowlist);

    // Save session metadata, including club_data and bounds
    db.data.sessions.push({
      id: sessionId,
      date: firstShotTimestamp,
      units: result.units,
      shots: result.shots,
      availableClubs: result.availableClubs,
      createdAt: new Date().toISOString(),
      signature,
      club_data: result.metadata ? result.metadata.club_data : undefined,
      bounds: sessionBounds
    });

    for (const shot of result.data) {
      db.data.shots.push({
        id: uuidv4(),
        sessionId,
        ...shot,
      });
    }

    await db.write();
    console.log(`✅ Added to database`);
  }
  console.log("\n✨ Seeding complete. Current sessions:");
  db.data.sessions.forEach(s => {
    console.log(`- ${s.date || s.filename} (${s.signature.slice(0, 8)}...)`);
  });
})();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));