import fs from 'node:fs';

export class Johnemon  {

    uuid: string;
    name: string;
    level: number;
    experience: number;
    baseAttackDamage: number;
    attackRange: number;
    defenseRange: number;
    health: number;
    baseHealth: number;
    fainted: boolean;
    catchPhrase: string;

  constructor() {
      this.uuid = this.generateUUID();
      this.name = this.generateName();
      this.level = 1;
      this.experience = 0;
      // stat values
      this.baseAttackDamage = this.getRandomNumber(1, 3);
      this.attackRange = this.getRandomNumber(1, 8);
      this.defenseRange = this.getRandomNumber(1, 4);
      // health values
      this.health = this.getRandomNumber(20, 30);
      this.baseHealth = this.health;
      this.fainted = false;
      this.catchPhrase = this.generateCatchPhrase();
  }

  /**
  * Generate a unique id
  * @private
  */
  private generateUUID(): string {
      return Date.now().toString(36) + Math.random().toString(36).substring(0, 18);
  }

  /**
   * Generate a random name
   * @private
   */
  private generateName(): string {
      const names = fs.readFileSync('src/utils/names.txt', 'utf8').split('\n').map(name => name.trim().replace(/,/g, ''));
      const pickedName1 = names[Math.floor(Math.random() * names.length)],
            pickedName2 = names[Math.floor(Math.random() * names.length)],
            slicedName1 = pickedName1.slice(0, pickedName1.length / 2),
            slicedName2 = pickedName2.slice(pickedName2.length / 2);

      return `${slicedName1}${slicedName2}`;
  }

  /**
   * Generate a random number between two values
   * @param min
   * @param max
   * @private
   */
  getRandomNumber(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
  * get a random catch phrase
  * @private
   */
  private generateCatchPhrase(): string {
      const phrases = [
          "Would you be my friend ?",
          "I will be the best johnemon of all time",
          "I will be the best like no one ever was",
          "You made a good choice",
          "I am the one you need",
      ];
      return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
  * give experience points to the johnemon
  * @param opponentLevel
  */
  gainExperience(opponentLevel: number): string {
      const experienceGain = this.getRandomNumber(1, 5) * opponentLevel;
      this.experience += experienceGain;
      if (this.experience >= this.level * 100) this.evolve();
      return `${this.name} gained ${experienceGain} experience points!`
  }

  /**
   * evolve the johnemon
   * @private
   */
  private evolve(): string {
        this.level += 1;

        this.attackRange += this.getRandomNumber(1, 5);
        this.defenseRange += this.getRandomNumber(1, 5);
        this.baseHealth += this.getRandomNumber(1, 5);

        return `${this.name} passed the level Level ${this.level}, Attack: ${this.attackRange}, Defense: ${this.defenseRange}, Maximum health: ${this.baseHealth}`;
  }

    /**
     * Load a johnemon from a data object
     * @param data
     */
  loadJohnemon(data: Johnemon): Johnemon {

        this.uuid = data.uuid;
        this.name = data.name;
        this.level = data.level;
        this.experience = data.experience;
        this.attackRange = data.attackRange;
        this.baseAttackDamage = data.baseAttackDamage;
        this.defenseRange = data.defenseRange;
        this.health = data.health;
        this.baseHealth = data.baseHealth;
        this.fainted = data.fainted;
        this.catchPhrase = data.catchPhrase;

        return this;
  }
}