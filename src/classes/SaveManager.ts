import * as fs from "node:fs";
import {Johnemon} from "./Johnemon";

interface SaveType {
    directory: string;
    saveFile: string;
}

interface SaveData {

    savedOn: string;
    day: number;
    logs: string[];
    trainer: {
        name: string;
        healingItems: number;
        revivingItems: number;
        johnemonBalls: number;
        JohnemonCollection: Johnemon[];
    }
}

class SaveManager implements SaveType {

    directory: string = "saves";
    saveFile: string = "save.json";

    get getSaveData(): SaveData {
        //check if saveDir exists if not crate it
        // check if saveFile exists if not create it and return
    }
}