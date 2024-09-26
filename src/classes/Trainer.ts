class Trainer {
    name: string
    johnemonCollection: Array<Object>[]
    healingItems: number
    reviveItems: number
    johnemonBalls: number

    constructor(name: string) {
        this.name = name
        this.johnemonCollection = []
        this.healingItems = 5
        this.reviveItems = 3
        this.johnemonBalls = 10
    }

    addJohnemonToCollection(johnemon: Object[]) {
        this.johnemonCollection.push(johnemon)
    }

    captureJohnemon(johnemon: Object[]) {
        this.addJohnemonToCollection(johnemon)
        this.johnemonBalls--;
    }


}

module.exports = Trainer