import express from "express";
import cors from "cors";
import sessionsRouter from "./routes/sessions.js";
import uploadRouter from "./routes/upload.js";
import fs from "fs";
import path from "path";
import db, { initDB } from "./utils/db.js";
import { Mutex } from "async-mutex";

const dbMutex = new Mutex();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/sessions", sessionsRouter);
app.use("/upload", (req, res, next) => {
  dbMutex.runExclusive(() => uploadRouter.handle(req, res, next)).catch((err) => {
    console.error("Upload handler error:", err);
    res.status(500).json({ message: "Internal server error" });
  });
});

(async () => {
  const dbPath = path.join(process.cwd(), "db.json");
  if (!fs.existsSync(dbPath)) {
    await initDB();
    await db.read();

    db.data.sessions = [];
    db.data.shots = [];
    await db.write();

    console.log("✨ Initialized new empty database.");
  } else {
    await db.read();

    db.data.sessions = db.data.sessions || [];
    db.data.shots = db.data.shots || [];
    await db.write();

    console.log("✅ Loaded existing database.");
  }
})();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));