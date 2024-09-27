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
  private readonly playerJohnemonColoed: string;
  private opponentJohnemon: Johnemon;
  private readonly opponentJohnemonColored: string;
  private world: World;
  public battleEnded: boolean;
  public turn: number;

  constructor(saveId: string, trainer: Trainer, world: World) {

    this.saveId = saveId;
    this.trainer = trainer;
    this.playerJhonemon = new Johnemon().loadJohnemon(trainer.johnemonCollection[0]);
    this.playerJohnemonColoed = colors.green(this.playerJhonemon.name);
    this.opponentJohnemon = new Johnemon();
    this.opponentJohnemonColored = colors.blue(this.opponentJohnemon.name);
    this.world = world;
    this.battleEnded = false;
    this.turn = 0;

  }

  /**
   * Start the battle
   */
  public startBattle(): Promise<void> {
   return new Promise((resolve, reject) => {
     console.log("Battle started");
     // Start the battle loop
     this.battleLoop()
         .then(() => {
              console.log("Battle ended");
              return resolve();
         })

   })
  }

  /**
   * End the battle
   */
  public endBattle(): void {
    // save the game
    const saveManager: SaveManager = new SaveManager();
    // update the player johnemon
    this.trainer.johnemonCollection = this.trainer.johnemonCollection.filter((entity) => entity.uuid !== this.playerJhonemon.uuid);
    this.trainer.johnemonCollection.push(this.playerJhonemon);

    const data: SaveData = {
      savedOn: new Date().toLocaleString(),
      uid: this.saveId,
      day: this.world.day,
      logs: this.world.logs,
      trainer: this.trainer
    };
    saveManager.saveData(data);

    this.battleEnded = true;
  }

  /**
   * Check if the battle has to be ended
   * @private
   */
  private battleStatus() {
    const opponentHGealth = this.opponentJohnemon.health;
    const playerHealth = this.playerJhonemon.health;

    if (opponentHGealth < 1) {
      console.log(`${this.opponentJohnemonColored} fainted`);
      this.playerJhonemon.gainExperience(this.opponentJohnemon.level);

      this.endBattle();
    }
    if (playerHealth < 1) {
      console.log(`${this.playerJohnemonColoed} fainted`);
      this.endBattle();
    }
  }

  /**
   * Battle loop logic
   * @private
   */
  private async battleLoop() {
    while (!this.battleEnded) {
        this.battleStatus();
        if ( this.battleEnded ) break;
       await this.displayBattleScreen()
    }
  }

  async displayBattleScreen() {
    const combatGui = `
        \t${colors.blue(this.opponentJohnemonColored)} lvl.${this.opponentJohnemon.level} |${colors.red(this.opponentJohnemon.health)} HP|
        \tvs
        \t${colors.green(this.playerJohnemonColoed)} lvl.${this.playerJhonemon.level} |${colors.red(this.playerJhonemon.health)} HP|
        `;

    return new Promise((resolve, reject) => {
      console.log(combatGui);
      this.playerAction()
          .then((action) => {
            switch (action) {
              case "attack":
                this.attackOpponent(this.playerJhonemon, this.opponentJohnemon);
                resolve(`Player attacked`);
                break;
              case "catch":
                break;
              case "run":
                this.endBattle();
                break;
              default:
                break;
            }
          })
          .catch((err) => {
            console.log(err);
          });
    })

  }

  attackOpponent(attacker: Johnemon, victim: Johnemon) {
    const damage = this.calculateDamage(attacker, victim);
    victim.health -= 100;

    if (attacker.name === this.playerJhonemon.name) {
      console.log(
        `${this.playerJohnemonColoed} attacked ${this.opponentJohnemonColored} for ${colors.red(damage)} damage`,
      );
    } else {
      console.log(
        `${this.opponentJohnemonColored} attacked ${this.playerJohnemonColoed} for ${colors.red(damage)} damage`,
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
          })
              .then((response: any) => {
                resolve(response.action);
              })
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
    ); // make damage positive
  }
}
