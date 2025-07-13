import express from "express";
import multer from "multer";
import fs from "fs";
import { parseGarminR50Csv } from "../utils/parseCsv.js";
import db from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";
import { calculateFileHash } from "../utils/fileHash.js";
import { boundsAllowlist } from "../constants/allowlist.js";
import { calculateSessionBounds } from "../utils/sessionBounds.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await parseGarminR50Csv(filePath);
    if (!result.data || result.data.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "CSV has no data or is invalid." });
    }

    const signature = calculateFileHash(filePath);
    console.log(`➡️ Processing: ${req.file.originalname}`);

    const existingSession = db.data.sessions.find(session => session.signature === signature);
    if (existingSession) {
      console.log(`⚠️ Skipping: Duplicate session of ${existingSession.date}.`);
      fs.unlinkSync(filePath);
      return res.status(200).json({ message: "Duplicate session. Already exists.", duplicate: true });
    }
    console.log(`✅ Added to database`);

    const sessionId = uuidv4();
    const sessionBounds = calculateSessionBounds(result.data, boundsAllowlist);

    db.data.sessions.push({
      id: sessionId,
      date: result.fileDate,
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
    fs.unlinkSync(filePath);

    res.status(200).json({ message: "Session uploaded and added successfully." });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Failed to process uploaded file." });
  }
});

export default router;