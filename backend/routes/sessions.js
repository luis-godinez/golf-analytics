import express from "express";
import { extractSessionMetadata } from "../utils/extractSessions.js";
import { computeGlobalStats } from "../utils/aggregateSessions.js";
import { computeProgressionSummary } from "../utils/progressionSummary.js";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await db.read();
    const sessions = db.data.sessions || [];
    const results = sessions.map(session =>
      extractSessionMetadata(session.filename, session.data)
    );
    res.json(results);
  } catch (error) {
    console.error("Failed to load sessions:", error);
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

router.get("/bounds", async (req, res) => {
  try {
    const globalStats = await computeGlobalStats();
    res.json(globalStats);
  } catch (error) {
    console.error("Failed to compute global stats:", error);
    res.status(500).json({ error: "Failed to compute global stats" });
  }
});

router.get("/progression-summary", async (req, res) => {
  const metric = req.query.metric;
  const clubs = req.query.clubs?.split(",") ?? [];
  try {
    const result = await computeProgressionSummary(metric, clubs);
    res.json(result); // result now includes { series, units }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to fetch parsed CSV data by filename from DB
router.get("/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename.endsWith(".csv")) {
      return res.status(400).json({ error: "Invalid file type requested" });
    }
    await db.read();
    const session = db.data.sessions.find(s => s.filename === filename);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({
      data: session.data,
      units: session.units
    });
  } catch (error) {
    console.error("Failed to load session file:", error);
    res.status(500).json({ error: "Failed to load session file" });
  }
});

export default router;
