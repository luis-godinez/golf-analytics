import fs from "fs";
import csv from "csv-parser";

export function parseGarminR50Csv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => {
        if (rows.length < 3) return reject(new Error("CSV must have at least two rows for Garmin R50 parsing"));

        const headers = Object.keys(rows[0]);
        const units = {};
        headers.forEach((key, idx) => {
          const unit = Object.values(rows[0])[idx];
          units[key] = unit;
        });

        const formattedData = rows.slice(1);
        resolve({ data: formattedData, units });
      })
      .on("error", (err) => reject(err));
  });
}