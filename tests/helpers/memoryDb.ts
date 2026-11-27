import Database from "better-sqlite3";

import type { Db } from "@/data/db";

/** A real SQLite database in memory behind the app's async `Db` interface, so SQL is tested for real. */
export function createMemoryDb(): Db {
  const sqlite = new Database(":memory:");
  return {
    async execAsync(sql) {
      sqlite.exec(sql);
    },
    async runAsync(sql, ...params) {
      return sqlite.prepare(sql).run(...params);
    },
    async getAllAsync<T>(sql: string, ...params: (string | number | null)[]) {
      return sqlite.prepare(sql).all(...params) as T[];
    },
    async getFirstAsync<T>(sql: string, ...params: (string | number | null)[]) {
      return (sqlite.prepare(sql).get(...params) as T | undefined) ?? null;
    },
  };
}
