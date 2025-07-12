import fs from "fs";
import csv from "csv-parser";

export function parseGarminR50Csv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim()
      }))
      .on("data", (data) => rows.push(data))
      .on("end", () => {
        if (rows.length < 3) return reject(new Error("CSV must have at least three rows for Garmin R50 parsing"));

        const units = rows[0];
        const formattedData = rows.slice(2);
        const firstDateStr = formattedData[0]?.Date;
        let fileDate = null;
        if (firstDateStr) {
          const parsedDate = new Date(firstDateStr);
          if (!isNaN(parsedDate)) {
            fileDate = parsedDate.toISOString();
          }
        }

        const shots = formattedData.length;
        const availableClubs = Array.from(new Set(formattedData.map(entry => entry["Club Type"])));

        // Detect club data
        let clubDataCount = 0;
        for (const row of formattedData) {
          const clubSpeed = row['Club Speed'] || row['club speed'] || row['clubSpeed'];
          if (clubSpeed && clubSpeed.trim() !== '') {
            clubDataCount++;
          }
        }
        const clubData = clubDataCount > 0;

        resolve({
          data: formattedData,
          units,
          fileDate,
          shots,
          availableClubs,
          metadata: {
            club_data: clubData
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}