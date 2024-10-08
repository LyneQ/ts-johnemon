import { Johnemon } from "./classes/Johnemon";
import { Trainer } from "./classes/Trainer";
import { World } from "./classes/World";
import { Arena } from "./classes/Arena";
import { SaveManager, SaveData } from "./classes/SaveManager";

const prompt = require("prompts");
const colors = require("colors/safe");

//main function to run the game
const initializeGame = async () => {
  console.clear();
  const saveManager: SaveManager = new SaveManager();
  await saveManager.initializeDatabase();

  const availableSaves: string[] = await saveManager.getSavesCollection();

  if (availableSaves.length === 0) {
    console.log("No save found, creating new save");
    const trainer: Trainer = new Trainer("Ash Ketchum");
    const world: World = new World();
    trainer.johnemonCollection.push(new Johnemon());

    const data: SaveData = {
      savedOn: new Date().toLocaleString(),
      uid: saveManager.generateUID,
      day: 1,
      logs: [],
      trainer: trainer,
    };
    await saveManager.saveData(data);

    // Check if the save was successful
    const newAvailableSaves: string[] = await saveManager.getSavesCollection();
    if (newAvailableSaves.length > 0) {
      console.log("New save created successfully");
    } else {
      console.error("Failed to create a new save.");
      return;
    }
  } else {
    const saveId: string = availableSaves[0];
    const save: SaveData | null = await saveManager.getSave(saveId);

    if (save) {
      const trainer: Trainer = new Trainer(save.trainer.name).loadTrainer(
        save.trainer,
      );
      const world: World = new World();

      await mainMenu(save, trainer, world);
      await dailyEvent(save, trainer, world);
    }
  }
};

const mainMenu = async (save: SaveData, trainer: Trainer, world: World) => {
  const saveManager: SaveManager = new SaveManager();
  await saveManager.initializeDatabase();

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
      await johnemonManager(save, trainer, world, saveManager);
      break;
    case "save":
      const data: SaveData = {
        savedOn: new Date().toLocaleString(),
        uid: save.uid,
        day: world.day,
        logs: world.logs,
        trainer: trainer,
      };
      await saveManager.saveData(data);
      console.log(colors.green("Game saved"));
      return await mainMenu(save, trainer, world);
    case "exit":
      return process.exit(0);
  }
};

const johnemonManager = async (
  save: SaveData,
  trainer: Trainer,
  world: World,
  saveManager: SaveManager,
  message?: string,
) => {
  console.clear();
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
    if (response.action === "nothing") return dailyEvent(save, trainer, world);

    const chooseJohnemon = await prompt({
      type: "select",
      name: "johnemon",
      message: "Choose a Johnemon",
      choices: trainer.johnemonCollection.map((j: Johnemon) => ({
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

            return await johnemonManager(
            save,
            trainer,
            world,
            saveManager,
            colors.red("You can't heal a Johnemon that is full life"),
          );
        } else {
        const healingStatus = await trainer
          .healJohnemon(johnemon)
          .catch(async (err) => {
            await johnemonManager(
              save,
              trainer,
              world,
              saveManager,
              colors.red(err),
            );
          });

        console.log(healingStatus);
        if (healingStatus?.status === "success") {
          await saveManager.saveData({
            savedOn: new Date().toLocaleString(),
            uid: save.uid,
            day: world.day,
            logs: world.logs,
            trainer: trainer,
          });
          return await johnemonManager(
            save,
            trainer,
            world,
            saveManager,
            colors.green(healingStatus.message),
          );
        } else {
          return await johnemonManager(
            save,
            trainer,
            world,
            saveManager,
            colors.red(healingStatus?.message),
          );
        }
      }
      case "revive":
  if (!johnemon.fainted) {
    return await johnemonManager(
      save,
      trainer,
      world,
      saveManager,
      colors.red("You can't revive a Johnemon that is not fainted"),
    );
  } else {
    const revivedStatus = await trainer.reviveJohnemon(johnemon);
    if (revivedStatus.status === "success") {
      await saveManager.saveData({
        savedOn: new Date().toLocaleString(),
        uid: save.uid,
        day: world.day,
        logs: world.logs,
        trainer: trainer,
      });
      return await johnemonManager(
        save,
        trainer,
        world,
        saveManager,
        colors.green(revivedStatus.message),
      );
    } else {
      return await johnemonManager(
        save,
        trainer,
        world,
        saveManager,
        colors.red(revivedStatus.message),
      );
    }
  }
      case "release":
        trainer.releaseJohnemon(johnemon);
        break;
    }
  });
};

const dailyEvent = async (save: SaveData, trainer: Trainer, world: World) => {
  console.clear();
  world.oneDayPasses();
  const event: any = world.getRandomizedEvent();
  world.addToLog(event.value);

  if (event.key === "fight") {
    console.log(colors.blue("A wild Johnemon appeared!"));
    const arena: Arena = new Arena(save.uid, trainer, world);

    await arena.startBattle();

    await mainMenu(save, trainer, world);
    if (!arena.battleEnded) {
      await dailyEvent(save, trainer, world);
    }
  } else if (event.key === "item") {
    console.log(colors.blue("You found an item!"));
    trainer.addRandomItemToInventory(1);
    await mainMenu(save, trainer, world);
    await dailyEvent(save, trainer, world);
  } else {
    console.log(colors.blue("Nothing happened today"));
    await mainMenu(save, trainer, world);
    await dailyEvent(save, trainer, world);
  }
};

initializeGame();
