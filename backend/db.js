import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

let db; // cache pool

async function initDB() {
  if (!db) {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    const conn = await db.getConnection();
    console.log('✅ DB Connected to', process.env.DB_NAME);
    conn.release();
  }

  return db;
}

// default export untuk yang pakai `import initDB from '../db.js'`
export default initDB;

// named export untuk yang pakai `import { db } from '../db.js'`
export { db };