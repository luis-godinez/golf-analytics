import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile("db.json");
const defaultData = { sessions: [] };
const db = new Low(adapter, defaultData);

export async function initDB() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

export default db;