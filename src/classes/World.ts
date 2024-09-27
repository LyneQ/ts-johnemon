

export class World {

    day: number;
    logs: string[];

    constructor() {
        this.day = 1;
        this.logs = [];
    }

    /**
     * make day pass
     * @param log
     */
    oneDayPasses() {
        this.day += 1;
        this.addToLog(`Day ${this.day - 1} has passed`);
    }

    /**
     * Add a log to the logs array
     * @param log
     */
    addToLog(log: string) {
        this.logs.push(log);
    }

    /**
     * Get a random event
     */
    getRandomizedEvent(): string {
        const events: any = [
            {
                key: "fight",
                value: "A wild Johnemon appeared!"
            },
            {
                key: "item",
                value: "You found a item!"
            },
            {
                key: "nothing",
                value: "Nothing happened today"
            }
        ]

        return events[Math.floor(Math.random() * events.length)]
    }

    /**
     * Load the world from save data
     * @param data
     */
    loadWorld(data: World): World {
        this.day = data.day;
        this.logs = data.logs;
        return this;
    }

}