import express from "express";
import { computeProgressionSummary } from "../utils/progressionSummary.js";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await db.read();
    const sessions = db.data.sessions || [];
    res.json(sessions);
  } catch (error) {
    console.error("Failed to load sessions:", error);
    res.status(500).json({ error: "Failed to load sessions" });
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

// Route to fetch session data by sessionId
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    await db.read();
    const session = db.data.sessions.find(s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    const shots = db.data.shots.filter(shot => shot.sessionId === sessionId);
    res.json({
      shots,
      units: session.units
    });
  } catch (error) {
    console.error("Failed to load session data:", error);
    res.status(500).json({ error: "Failed to load session data" });
  }
});

export default router;
