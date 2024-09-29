import { Johnemon } from "./classes/Johnemon";
import { Trainer } from "./classes/Trainer";
import { World } from "./classes/World";
import { Arena } from "./classes/Arena";
import { SaveManager, SaveData } from "./classes/SaveManager";


const prompt = require("prompts");
const colors = require("colors/safe");
//main function to run the game
const initalizeGame = async () => {
    console.clear();
    const johnemon: Johnemon = new Johnemon();
    const saveManager: SaveManager = new SaveManager();

    const availableSaves: string[] | null = saveManager.getSavesCollection;

    if (availableSaves?.length === 0) {
        console.log("No save found, creating new save");
        const trainer: Trainer = new Trainer("Ash Ketchum");
        const world: World = new World();
        trainer.johnemonCollection.push(new Johnemon());

        const data: SaveData = {
            savedOn: new Date().toLocaleString(),
            uid: saveManager.generateUID,
            day: 1,
            logs: [],
            trainer: trainer
        };
        saveManager.saveData(data);
        await initalizeGame();
    }

    const saveId: string = availableSaves![0].replace(".json", "");
    const save: SaveData | null = saveManager.getSave(saveId);

    const trainer: Trainer = new Trainer(save!.trainer.name).loadTrainer(save!.trainer);
    const world: World = new World();

    await mainMenu(save!, trainer, world);
    await dailyEvent(save!, trainer, world);
};

const mainMenu = async (save: SaveData, trainer: Trainer, world: World) => {

    const response = await prompt({
        type: "select",
        name: "action",
        message: "Welcome to Johnemon !",
        choices: [
            { title: "Continue", value: "continue" },
            { title: "Save", value: "save" },
            { title: "Exit", value: "exit" },
        ],
    });

    switch (response.action) {
        case "continue":
            await johnemonManager(save, trainer, world);
            break;
            case "save":
            const saveManager: SaveManager = new SaveManager();
            const data: SaveData = {
                savedOn: new Date().toLocaleString(),
                uid: save.uid,
                day: world.day,
                logs: world.logs,
                trainer: trainer
            };
            saveManager.saveData(data);
            console.log(colors.green("Game saved"));
            return await mainMenu(save, trainer, world);
        case "exit":
            return process.exit(0);
    }
};

const johnemonManager = async (save: SaveData, trainer: Trainer, world: World) => {
    console.clear();
    const response = await prompt({
        type: "select",
        name: "action",
        message: "What would you like to do?",
        choices: [
            { title: "Heal one of your Johnemon", value: "heal" },
            { title: "Revive one of your Johnemon", value: "revive" },
            { title: "Release one of your Johnemon", value: "release" },
            { title: "Nothing", value: "nothing" },
        ],
    });
    if (response.action === "nothing") return dailyEvent(save, trainer, world);

    console.clear();
    const chooseJohnemon = await prompt({
        type: "select",
        name: "johnemon",
        message: "Choose a Johnemon",
        choices: trainer.johnemonCollection.map((j: Johnemon) => ({
            title: `${j.name} fainted: ${j.fainted}, health: ${j.health}`,
            value: j,
        })),
    });

    const johnemon = new Johnemon().loadJohnemon(chooseJohnemon);

    switch (response.action) {
        case "heal":
            if (johnemon.health === johnemon.baseHealth) {
                console.log(colors.red("You can't heal a Johnemon that is full life"));
                await johnemonManager(save, trainer, world);
            }
            trainer.healJohnemon(johnemon);
            break;
        case "revive":
            if (johnemon.fainted) {
                console.log(colors.red("You can't revive a Johnemon that is not fainted"));
                await johnemonManager(save, trainer, world);
            }
            trainer.reviveJohnemon(johnemon);
            break;
        case "release":
            trainer.releaseJohnemon(johnemon);
            break;
    }
};

const dailyEvent = async (save: SaveData, trainer: Trainer, world: World) => {
    console.clear();
    world.oneDayPasses();
    const event: any = world.getRandomizedEvent();
    world.addToLog(event.value);

    if (event.key === "fight") {
        console.log(colors.blue("A wild Johnemon appeared!"));
        const arena: Arena = new Arena(save!.uid, trainer, world);

        await arena.startBattle();

        await mainMenu(save!, trainer, world);
        if (!arena.battleEnded) {
            await dailyEvent(save!, trainer, world);
        }
    } else if (event.key === "item") {
        console.log(colors.blue("You found an item!"));
        trainer.addRandomItemToInventory(1);
        await mainMenu(save!, trainer, world);
        await dailyEvent(save!, trainer, world);
    } else {
        console.log(colors.blue("Nothing happened today"));
        await mainMenu(save!, trainer, world);
        await dailyEvent(save!, trainer, world);
    }
};

initalizeGame();