import express from "express";
import cors from "cors";
import sessionsRouter from "./routes/sessions.js";
import fs from "fs";
import path from "path";
import { parseGarminR50Csv } from "./utils/parseCsv.js";
import db, { initDB } from "./utils/db.js";


const app = express();
app.use(cors());
app.use(express.json());

app.use("/sessions", sessionsRouter);

(async () => {
  await initDB();
  const csvDir = path.join(process.cwd(), "CSVs");
  const filenames = fs.readdirSync(csvDir).filter(file => file.endsWith(".csv"));
  console.log("Seeding db:")
  console.log("files:", filenames)
  await db.read();
  for (const filename of filenames) {
    const alreadyExists = db.data.sessions.some(session => session.filename === filename);
    if (!alreadyExists) {
      const filePath = path.join(csvDir, filename);
      const result = await parseGarminR50Csv(filePath);
      db.data.sessions.push({
        filename,
        data: result.data,
        units: result.units
      });
    }
  }
  console.log("Seeding complete")
  await db.write();
})();

const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));