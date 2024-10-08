import mariadb, {Pool} from 'mariadb';
import dotenv from 'dotenv';
dotenv.config();

import { Trainer } from './Trainer';

export interface SaveData {
  savedOn: string;
  uid: string;
  day: number;
  logs: string[];
  trainer: Trainer;
}
let pool: Pool;

try {
  pool = mariadb.createPool({
    host: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 5,
  });
} catch (err: any) {
  console.log(err.sqlMessage.red);
}

export class SaveManager {
  protected conn: mariadb.PoolConnection | undefined;

  constructor() {
    if (!process.env.DB_NAME) {
      throw new Error("Database name is not provided!");
    }
  }

   async initializeDatabase(): Promise<void> {
    this.conn = await pool.getConnection();
    await this.createDatabase();
    console.log("Database connection established");
    await this.createSchema();
  }

  private async createDatabase(): Promise<void> {
    try {
      this.conn?.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
      this.conn?.query(`USE ${process.env.DB_NAME};`);
    }
    catch (err) {
      console.error("Database creation failed!", err);
    }
  }

  private async createSchema(): Promise<void> {
    try {
      await this.conn?.query(`
        CREATE TABLE IF NOT EXISTS saves (
          uid VARCHAR(255) PRIMARY KEY,
          savedOn VARCHAR(255),
          day INT,
          logs JSON,
          trainer JSON
        );
      `);
      console.log("Schema created or already exists");
    } catch (err) {
      console.error("Error creating schema:", err);
    }
  }

  get generateUID(): string {
    return (
      Date.now().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  async getSavesCollection(): Promise<string[]> {
    try {
      const rows = await this.conn?.query('SELECT uid FROM saves');
      return rows?.map((row: { uid: string }) => row.uid) || [];
    } catch (err) {
      console.error("Error getting saves collection:", err);
      return [];
    }
  }

  async getSave(uid: string): Promise<SaveData | null> {
    try {
      const rows = await this.conn?.query('SELECT * FROM saves WHERE uid = ?', [uid]);
      if (rows?.length) {
        return rows[0];
      }
      return null;
    } catch (err) {
      console.error("Error getting save:", err);
      return null;
    }
  }

  async saveData(data: SaveData): Promise<void> {
    try {

      console.log("Saving data...");

        if (this.conn) {
          const result = await this.conn.query(
            'INSERT INTO saves (savedOn, uid, day, logs, trainer) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE savedOn = VALUES(savedOn), day = VALUES(day), logs = VALUES(logs), trainer = VALUES(trainer)',
            [data.savedOn, data.uid, data.day, JSON.stringify(data.logs), JSON.stringify(data.trainer)]
          );
        } else {
          console.error("Internal error");
        }
    } catch (err) {
      console.error("Error saving data:", err);
    }
  }
}