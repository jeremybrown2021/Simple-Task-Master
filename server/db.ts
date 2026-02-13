import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let parsedDatabaseUrl: URL;
try {
  parsedDatabaseUrl = new URL(process.env.DATABASE_URL);
} catch {
  throw new Error(
    "Invalid DATABASE_URL format. Expected: mysql://USER:PASSWORD@HOST:3306/DB_NAME",
  );
}

if (parsedDatabaseUrl.protocol !== "mysql:") {
  throw new Error("Invalid DATABASE_URL protocol. Use mysql://");
}

if (!parsedDatabaseUrl.hostname || !parsedDatabaseUrl.pathname || parsedDatabaseUrl.pathname === "/") {
  throw new Error(
    "Invalid DATABASE_URL. Host or database name is missing. Expected: mysql://USER:PASSWORD@HOST:3306/DB_NAME",
  );
}

export const pool = mysql.createPool(process.env.DATABASE_URL);
export const db = drizzle(pool, { schema, mode: "default" });
