import { Game } from './classes/Game';

const game = new Game();

const main = async (gameLoop: Game) => {
  try {
    await gameLoop.initializeGameData();
    while (true) {
      await gameLoop.mainMenu();
      await gameLoop.johnemonMenu();
      await gameLoop.dailyEvent();
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

main(game);