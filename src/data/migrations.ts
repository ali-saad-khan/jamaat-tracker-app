import type { Db } from "./db";

export const DATABASE_VERSION = 2;

/** Brings the database up to `DATABASE_VERSION`. Safe to run on every launch. */
export async function migrate(db: Db): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let version = row?.user_version ?? 0;
  if (version >= DATABASE_VERSION) return;

  if (version < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS entries (
        date TEXT NOT NULL,
        prayer TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (date, prayer)
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
    version = 1;
  }

  if (version < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS prayer_times (
        date TEXT NOT NULL,
        location_key TEXT NOT NULL,
        fajr TEXT NOT NULL,
        dhuhr TEXT NOT NULL,
        asr TEXT NOT NULL,
        maghrib TEXT NOT NULL,
        isha TEXT NOT NULL,
        fetched_at INTEGER NOT NULL,
        PRIMARY KEY (date, location_key)
      );
    `);
    version = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
