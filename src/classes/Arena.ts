import { Trainer } from "./Trainer";
import { Johnemon } from "./Johnemon";
import { World } from "./World";
import { SaveManager, SaveData } from "./SaveManager";

const prompt = require("prompts");
const colors = require("colors/safe");

export class Arena {
  public saveId: string;
  private readonly trainer: Trainer;
  private readonly playerJhonemon: Johnemon;
  private readonly playerJohnemonColored: string;
  private opponentJohnemon: Johnemon;
  private readonly opponentJohnemonColored: string;
  private world: World;
  public battleEnded: boolean;
  public turn: number;

  constructor(saveId: string, trainer: Trainer, world: World) {
    this.saveId = saveId;
    this.trainer = trainer;
    this.playerJhonemon = new Johnemon().loadJohnemon(
      trainer.johnemonCollection[0],
    );
    this.playerJohnemonColored = colors.green(this.playerJhonemon.name);
    this.opponentJohnemon = new Johnemon();
    this.opponentJohnemonColored = colors.blue(this.opponentJohnemon.name);
    this.world = world;
    this.battleEnded = false;
    this.turn = 0;
  }

  /**
   * End the battle
   */
  public async endBattle(): Promise<void> {
    // save the game
    const saveManager: SaveManager = new SaveManager();
    return await saveManager.initializeDatabase().then((r) => {

      // update the player johnemon
      this.trainer.johnemonCollection = this.trainer.johnemonCollection.filter(
        (entity) => entity.uuid !== this.playerJhonemon.uuid,
      );
      this.trainer.johnemonCollection.push(this.playerJhonemon);

      const data: SaveData = {
        savedOn: new Date().toLocaleString(),
        uid: this.saveId,
        day: this.world.day,
        logs: this.world.logs,
        trainer: this.trainer,
      };
      return saveManager.saveData(data).then((r) => {
        console.log(colors.green("Game saved"));
        this.battleEnded = true;
      });
    });
  }

  /**
   * Check if the battle has to be ended
   * @private
   */
  private async battleStatus() {
    const opponentHealth = this.opponentJohnemon.health;
    const playerHealth = this.playerJhonemon.health;

    if (opponentHealth <= 0) {
      console.log(`${this.opponentJohnemonColored} fainted`);
      this.playerJhonemon.gainExperience(this.opponentJohnemon.level);

      await this.endBattle();
    }
    if (playerHealth < 1) {
      console.log(`${this.playerJohnemonColored} fainted`);
      await this.endBattle();
    }
  }

  /**
   * Battle loop logic
   * @private
   */
  async battleLoop() {
    return new Promise(async (resolve) => {
      while (true) {
          if (this.battleEnded) return resolve("Battle ended");

            await this.battleStatus();
            if (this.battleEnded) {
              resolve("Battle ended");
            }
            await this.displayBattleScreen();
      }
    });
  }

  async displayBattleScreen() {
    const combatGui = `
        \t${colors.blue(this.opponentJohnemonColored)} lvl.${this.opponentJohnemon.level} |${colors.red(this.opponentJohnemon.health)} HP|
        \tvs
        \t${colors.green(this.playerJohnemonColored)} lvl.${this.playerJhonemon.level} |${colors.red(this.playerJhonemon.health)} HP|
        `;

    return new Promise((resolve) => {
        console.log(combatGui);
        this.playerAction()
            .then(async (action) => {
                switch (action) {
                    case "attack":
                        this.attackOpponent(this.playerJhonemon, this.opponentJohnemon);
                        resolve(`Player attacked`);
                        break;
                    case "catch":
                        this.trainer.addJohnemonToCollection(this.opponentJohnemon);
                        this.battleEnded = true;
                        await this.endBattle();
                        resolve(`Player caught the Johnemon`);
                        break;
                    case "run":
                        this.battleEnded = true;
                        await this.endBattle();
                        resolve(`Player ran away`);
                        break;
                    default:
                        resolve(`No action taken`);
                        break;
                }
            })
            .catch((err) => {
                console.log(err);
                resolve(`Error occurred`);
            });
    });
}

  attackOpponent(attacker: Johnemon, victim: Johnemon) {
    const damage = this.calculateDamage(attacker, victim);
    victim.health -= 6;

    if (attacker.name === this.playerJhonemon.name) {
      console.log(
        `${this.playerJohnemonColored} attacked ${this.opponentJohnemonColored} for ${colors.red(damage)} damage`,
      );
    } else {
      console.log(
        `${this.opponentJohnemonColored} attacked ${this.playerJohnemonColored} for ${colors.red(damage)} damage`,
      );
    }
  }

  /**
   * get the player action
   */
  async playerAction() {
    return new Promise((resolve, reject) => {
      prompt({
        type: "select",
        name: "action",
        message: "Choose an action",
        choices: [
          { title: "Attack", value: "attack" },
          { title: "Catch", value: "catch" },
          { title: "Run", value: "run" },
        ],
      }).then((response: any) => {
        resolve(response.action);
      });
    });
  }

  /**
   * Calculate the damage
   * @param attacker
   * @param victim
   * @private
   */
  calculateDamage(attacker: Johnemon, victim: Johnemon) {
    return Math.floor(
      Math.random() * (attacker.attackRange - attacker.baseAttackDamage + 3) +
        attacker.baseAttackDamage * attacker.level -
        victim.defenseRange,
    );
  }
}
