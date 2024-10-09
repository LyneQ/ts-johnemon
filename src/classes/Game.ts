import { Johnemon } from "./Johnemon";
import { Trainer } from "./Trainer";
import { World } from "./World";
import { Arena } from "./Arena";
import { SaveManager, SaveData } from "./SaveManager";
import * as http from "node:http";

const prompt = require("prompts");
const colors = require("colors/safe");

export class Game {

    SaveManager: SaveManager;
    SaveData: SaveData | null = null;
    // @ts-ignore
    Arena: Arena;
    // @ts-ignore
    Trainer: Trainer;
    // @ts-ignore
    World: World;

    constructor() {
        this.SaveManager = new SaveManager();
    }

    /**
     * function to initialize the save data
     */
    async initializeGameData() {
        await this.SaveManager.initializeDatabase();
        const availableSaves: string[] = await this.SaveManager.getSavesCollection();

        if (availableSaves.length === 0) {

            await this.createNewSave();
            await this.initializeGameData()
        }
        else {
            const saveId: string = availableSaves[0];
            await this.SaveManager.getSave(saveId) ? this.SaveData = await this.SaveManager.getSave(saveId) : null;

            if (this.SaveData) {
                this.Trainer = new Trainer(this.SaveData.trainer.name).loadTrainer(
                    this.SaveData.trainer,
                );
                this.World = new World();
            }
        }
    }

    async createNewSave() {
        const starterJohnemon = [new Johnemon(), new Johnemon(), new Johnemon()];

        const questionChain = [
            {
                type: "text",
                name: "name",
                message: "What's your name?",
            },
            {
                type: "select",
                name: "johnemon",
                message: "Choose your first Johnemon",
                choices: starterJohnemon.map((j: Johnemon) => ({title: j.name, value: j})),
            }
        ];

        await prompt(questionChain)
            .then(async (response: any) => {
                this.Trainer = new Trainer(response.name);
                this.Trainer.johnemonCollection.push(response.johnemon);

                this.World = new World();

                const data: SaveData = {
                    savedOn: new Date().toLocaleString(),
                    uid: this.SaveManager.generateUID,
                    day: 1,
                    logs: [],
                    trainer: this.Trainer,
                };
                await this.SaveManager.saveData(data);
            });
    }

    /**
     * send the player to the main menu
     */
    async mainMenu(): Promise<any> {

        return new Promise(async (resolve) => {

            const response = await prompt({
                type: "select",
                name: "action",
                message: "Welcome to Johnemon !",
                choices: [
                    {title: "Continue", value: "continue"},
                    {title: "Save", value: "save"},
                    {title: "Exit", value: "exit"},
                ],
            });
            switch (response.action) {
                case "continue":
                    resolve(response.action);
                    break;
                case "save":
                    const data: SaveData = {
                        savedOn: new Date().toLocaleString(),
                        uid: this.SaveData!.uid,
                        day: this.SaveData!.day,
                        logs: this.SaveData!.logs,
                        trainer: this.SaveData!.trainer,
                    };
                    await this.SaveManager.saveData(data);
                    console.log(colors.green("Game saved"));
                    return await this.mainMenu();
                case "exit":
                    return process.exit(0);
            }

        })

    }

    /**
     * send player to the johnemon menu (heal, revive, release)
     * @param message
     */
    async johnemonMenu(message: string | null = null): Promise<any> {
        message ? console.log(colors.yellow(message)) : null;

        await prompt({
            type: "select",
            name: "action",
            message: "What would you like to do?",
            choices: [
                { title: "Heal one of your Johnemon", value: "heal" },
                { title: "Revive one of your Johnemon", value: "revive" },
                { title: "Release one of your Johnemon", value: "release" },
                { title: "Nothing", value: "nothing" },
            ],
        }).then(async (response: any) => {
            if (response.action === "nothing") return;

            const chooseJohnemon = await prompt({
                type: "select",
                name: "johnemon",
                message: "Choose a Johnemon",
                choices: this.Trainer.johnemonCollection.map((j: Johnemon) => ({
                    title: `${j.name} fainted: ${j.fainted ? "yes" : "no"}, health: ${j.health}`,
                    value: j,
                })),
            });

            const johnemon = new Johnemon().loadJohnemon(chooseJohnemon.johnemon);

            switch (response.action) {
                default:
                    break;
                case "heal":
                    if (johnemon.health >= johnemon.baseHealth) {

                        return await this.johnemonMenu(colors.red("You can't heal a Johnemon that is full life"));
                    } else {
                        const healingStatus = await this.Trainer
                            .healJohnemon(johnemon)
                            .catch(async (err: any) => {
                                await this.johnemonMenu(colors.red(err));
                            });

                        console.log(healingStatus);

                        if (healingStatus?.status === "success") {
                            await this.SaveManager.saveData({
                                savedOn: new Date().toLocaleString(),
                                uid: this.SaveData!.uid,
                                day: this.SaveData!.day,
                                logs: this.SaveData!.logs,
                                trainer: this.SaveData!.trainer,
                            });
                            return await this.johnemonMenu(colors.green(healingStatus.message));
                        } else {
                            return await this.johnemonMenu(colors.red(healingStatus?.message));
                        }
                    }
                case "revive":
                    if (!johnemon.fainted) {
                        return await this.johnemonMenu(colors.red("You can't revive a Johnemon that is not fainted"),);
                    } else {
                        const revivedStatus = await this.Trainer.reviveJohnemon(johnemon);
                        if (revivedStatus.status === "success") {
                            await this.SaveManager.saveData({
                                savedOn: new Date().toLocaleString(),
                                uid: this.SaveData!.uid,
                                day: this.SaveData!.day,
                                logs: this.SaveData!.logs,
                                trainer: this.SaveData!.trainer,
                            });
                            return await this.johnemonMenu(colors.green(revivedStatus.message));
                        } else {
                            return await this.johnemonMenu(colors.green(revivedStatus.message));
                        }
                    }
                case "release":
                    const releaseStatus =  await this.Trainer.releaseJohnemon(johnemon);
                    await this.SaveManager.saveData({
                      savedOn: new Date().toLocaleString(),
                      uid: this.SaveData!.uid,
                      day: this.World.day,
                      logs: this.World.logs,
                      trainer: this.Trainer,
                    });
                    if (releaseStatus.status === "success") {
                        return await this.johnemonMenu(colors.green(releaseStatus.message));
                    }
                    return await this.johnemonMenu(colors.red(releaseStatus.message));
            }
        });
    }

    /**
     * function to simulate the event of the day
     */
    async dailyEvent() {
        this.World.oneDayPasses();
        const event: any = this.World.getRandomizedEvent();
        this.World.addToLog(event.value);

        if (event.key === "fight") {
            console.log(colors.blue("A wild Johnemon appeared!"));
            this.Arena = new Arena(this.SaveData!.uid, this.Trainer, this.World);

            await this.Arena.battleLoop();
            console.log('Battle ended in game.ts');
        } else if (event.key === "item") {
            const item =  this.Trainer.addRandomItemToInventory(1);
            console.log(colors.blue(`You found a ${colors.underline(colors.yellow(item))}`));

            await this.SaveManager.saveData({
                savedOn: new Date().toLocaleString(),
                uid: this.SaveData!.uid,
                day: this.SaveData!.day,
                logs: this.SaveData!.logs,
                trainer: this.SaveData!.trainer,
            });
        } else {
            console.log(colors.blue("Nothing happened today"));
        }
    }
}