import { Johnemon } from "./Johnemon";

export class Trainer {
  name: string;
  inventory: {
    healingItems: number;
    reviveItems: number;
    johnemonBalls: number;
  };
  johnemonCollection: Johnemon[];

  constructor(name: string) {
    this.name = name;
    this.johnemonCollection = [];
    this.inventory = {
      healingItems: 5,
      reviveItems: 3,
      johnemonBalls: 10,
    };
  }

  /**
   * Add a Johnemon to the collection
   * @param johnemon
   */
  addJohnemonToCollection(johnemon: Johnemon) {
    this.johnemonCollection.push(johnemon);
    this.inventory.johnemonBalls--;
  }

  /**
   * Remove a Johnemon from the collection
   * @param johnemon
   */
  removeJohnemonFromCollection(johnemon: Johnemon) {
    this.johnemonCollection = this.johnemonCollection.filter(
      (j) => j !== johnemon,
    );
  }

  /**
   * Heal a Johnemon
   * @param johnemon
   */
  healJohnemon(
    johnemon: Johnemon,
  ): Promise<{ message: string; status: string }> {
    return new Promise((resolve, reject) => {
      if (this.inventory.healingItems > 0) {
        const johnemonInCollection = this.johnemonCollection.find(
          (j) => j.uuid === johnemon.uuid,
        );

        johnemonInCollection
          ? (johnemonInCollection.health = johnemonInCollection.baseHealth)
          : reject({
              message: "Johnemon not found",
              status: "error",
            });
        this.inventory.healingItems--;
        return resolve({
          message: `${johnemon.name} health is now full`,
          status: "success",
        });
      }
    });
  }

  reviveJohnemon(
    johnemon: Johnemon,
  ): Promise<{ message: string; status: string }> {
    return new Promise((resolve, reject) => {
      if (this.inventory.reviveItems > 0) {
        const johnemonInCollection = this.johnemonCollection.find(
          (j) => j.uuid === johnemon.uuid,
        );

        if (johnemonInCollection) {
          johnemonInCollection.health = johnemonInCollection.baseHealth;
          johnemonInCollection.fainted = false;
          this.inventory.reviveItems--;
          resolve({
            message: `${johnemon.name} has been revived`,
            status: "success",
          });
        } else {
          reject({
            message: "Johnemon not found",
            status: "error",
          });
        }
      } else {
        reject({
          message: "No revive items left",
          status: "error",
        });
      }
    });
  }

  /**
   * Release a Johnemon
   * @param johnemon
   */
  releaseJohnemon(johnemon: Johnemon): Promise<{ message: string; status: string }> {

    return new Promise((resolve, reject) => {

      this.johnemonCollection = this.johnemonCollection.filter(
          (j) => j.uuid !== johnemon.uuid,
      )
      resolve({message: `${johnemon.name} has been released`, status: "success"})
    })
  }

  /**
   * Add a random item to the inventory
   * @param quantity
   */
  addRandomItemToInventory(quantity: number) {
    // get random item in player inventory
    const items = Object.keys(this.inventory);
    const randomItem = items[
      Math.floor(Math.random() * items.length)
    ] as keyof Trainer["inventory"];

    console.log(randomItem);

    this.inventory[randomItem] += quantity;
  }

  /**
   * Add an item to the inventory
   * @param item
   * @param amount
   */
  editItemInInventory(item: keyof Trainer["inventory"], amount: number) {
    this.inventory[item] = amount;
  }

  /**
   * Load a trainer from save data
   * @param data
   */
  loadTrainer(data: Trainer): Trainer {
    this.name = data.name;
    this.johnemonCollection = data.johnemonCollection;
    this.inventory = data.inventory;
    return this;
  }
}
