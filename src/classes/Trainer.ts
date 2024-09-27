import {Johnemon} from "./Johnemon";


export class Trainer {

    name: string
    inventory: {
        healingItems: number
        reviveItems: number
        johnemonBalls: number
    }
    johnemonCollection: Johnemon[]

    constructor(name: string) {
        this.name = name
        this.johnemonCollection = []
            this.inventory = {
                healingItems: 5,
                reviveItems: 3,
                johnemonBalls: 10
            }
    }

    /**
     * Add a Johnemon to the collection
     * @param johnemon
     */
    addJohnemonToCollection(johnemon: Johnemon) {
        this.johnemonCollection.push(johnemon)
        this.inventory.johnemonBalls--;
    }

    /**
     * Remove a Johnemon from the collection
     * @param johnemon
     */
    removeJohnemonFromCollection(johnemon: Johnemon) {
        this.johnemonCollection = this.johnemonCollection.filter((j) => j !== johnemon)
    }

    /**
     * Heal a Johnemon
     * @param johnemon
     */
    healJohnemon(johnemon: Johnemon) {
        if (this.inventory.healingItems > 0) {
            johnemon.health = johnemon.baseHealth
            this.inventory.healingItems--
        }
    }

    /**
     * Revive a Johnemon
     * @param johnemon
     */
    reviveJohnemon(johnemon: Johnemon) {
        if (this.inventory.reviveItems > 0) {
            johnemon.health = johnemon.baseHealth
            johnemon.fainted = false
            this.inventory.reviveItems--
        }
    }

    releaseJohnemon(johnemon: Johnemon) {
        this.johnemonCollection = this.johnemonCollection.filter((j) => j !== johnemon)
    }

    /**
     * Add an item to the inventory
     * @param item
     * @param amount
     */
    editItemInInventory(item: keyof Trainer['inventory'], amount: number) {
        this.inventory[item] = amount
    }

    /**
     * Load a trainer from save data
     * @param data
     */
    loadTrainer(data: Trainer): Trainer {
        this.name = data.name
        this.johnemonCollection = data.johnemonCollection
        this.inventory = data.inventory
        return this
    }


}