import mysql from "mysql2/promise";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "department_management",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: "+00:00",
  charset: "utf8mb4",
});

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    logger.info("✅  MySQL connected successfully");
    conn.release();
  } catch (err) {
    logger.error("❌  MySQL connection failed:", err);
    process.exit(1);
  }
}

export default pool;
