import * as fs from "node:fs";
import {Trainer} from "./Trainer";


export interface SaveData {
  savedOn: string;
  uid: string;
  day: number;
  logs: string[];
  trainer: Trainer;
}

export class SaveManager {
  directory: string = "./src/saves";

  constructor() {
    this.checkSaveDir();
  }

  /**
   * Generate a unique id
   */
  get generateUID(): string {
    return (
      Date.now().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Check if the save directory exists, if not create it
   */
  private checkSaveDir(): void {
    if (!fs.existsSync(this.directory)) fs.mkdirSync(this.directory);
  }

  /**
   * Get all save files in the saves directory
   */
  get getSavesCollection(): string[] | null {
    return fs
      .readdirSync(this.directory)
      .filter((file) => file.endsWith(".json"));
  }

  /**
   * Get save data from a file
   * @param uid
   */
  getSave(uid: string): SaveData | null {
    const filePath = `${this.directory}/${uid}.json`;
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf-8")) : null;
  }

  /**
   * Save game data to a file
   * @param data
   */
  saveData(data: {
    savedOn: string;
    day: number;
    uid: string;
    logs: string[];
    trainer: Trainer;
  }): string | void {
    fs.writeFileSync(
      `${this.directory}/${data.uid}.json`,
      JSON.stringify(data, null, 2),
      null,
    );
  }
}
