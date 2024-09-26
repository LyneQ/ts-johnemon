import fs from 'node:fs';

interface Johnemons {
    uuid: string;
    name: string;
    level: number;
    experience: number;
    attackRange: number;
    defenseRange: number;
    health: number;
    baseHealth: number;
    fainted: boolean;
    catchPhrase: string;
}

export class Johnemon implements Johnemons {

    uuid: string;
    name: string;
    level: number;
    experience: number;
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
      this.attackRange = this.getRandomNumber(1, 8);
      this.defenseRange = this.getRandomNumber(1, 3);
      // health values
      this.health = this.getRandomNumber(10, 30);
      this.baseHealth = this.health;
      this.fainted = false;
        this.catchPhrase = this.generateCatchPhrase();
  }

  private generateUUID(): string {
      return Date.now().toString(36) + Math.random().toString(36).substring(0, 18);
  }

  private generateName(): string {
      const names = fs.readFileSync('src/utils/names.txt', 'utf8').split('\n').map(name => name.trim().replace(/,/g, ''));
      const pickedName1 = names[Math.floor(Math.random() * names.length)],
            pickedName2 = names[Math.floor(Math.random() * names.length)],
            slicedName1 = pickedName1.slice(0, pickedName1.length / 2),
            slicedName2 = pickedName2.slice(pickedName2.length / 2);

      return `${slicedName1}${slicedName2}`;
  }

    getRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

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

    gainExperience(opponentLevel: number): string {
        const experienceGain = this.getRandomNumber(1, 5) * opponentLevel;
        this.experience += experienceGain;
        if (this.experience >= this.level * 100) this.evolve();

        return `${this.name} gained ${experienceGain} experience points!`
    }

    private evolve(): string {
        this.level += 1;

        this.attackRange += this.getRandomNumber(1, 5);
        this.defenseRange += this.getRandomNumber(1, 5);
        this.baseHealth += this.getRandomNumber(1, 5);

        return `${this.name} passed the level Level ${this.level}, Attack: ${this.attackRange}, Defense: ${this.defenseRange}, Maximum health: ${this.baseHealth}`;
    }

}