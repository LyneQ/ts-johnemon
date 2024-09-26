import Blessed from 'blessed';
export class Gui {

    private screen: any;
    private box: any;
    private readonly _title: string;

    constructor(title: string) {
        this._title = title;
        this.init();
        this.keyBinding();
        this.displayKeyBinding()
    }

    private init() {
        this.screen = Blessed.screen({
            smartCSR: true,
            title: "Johnemon"
        })

        this.box = Blessed.box({
            top: 'center',
            // left: 'center',
            width: '75%',
            height: '75%',
            content: this._title,
            align: 'center',
            tags: true,
            border: {
                type: 'line'
            },
        })
        this.box.text

        this.screen.append(this.box)
        this.box.focus()
        this.screen.render()
    }

    private keyBinding() {
        this.screen.key(['escape', 'q', 'C-c'], function(ch:any, key:any) {
            return process.exit(0);
        });
    }

    private displayKeyBinding() {
       const keyBinding = Blessed.box({
        parent: this.screen,
        // left: '100%',
        top: 'center',
        height: "75%",
           width: "25%",
        content: 'Press {bold}q{/bold} or {bold}ESC{/bold} to exit\nPress {bold}space{/bold} to continue',
           tags: true,
           border: {
               type: 'line'
           },
})

        this.screen.append(keyBinding)
        this.screen.render()
    }

    requestInput(question: string) {

        const prompt = Blessed.prompt({
            parent: this.screen,
            border: 'line',
            height: 'shrink',
            width: 'half',
            top: 'center',
            left: 'center',
            fg: '#8246db',
            label: 'Prompt',
            tags: true,
            keys: true,
            vi: true
        });

        prompt.input(question, '', (err: any, value: string) => {
            if (err) {
                console.error(err);
                return process.exit(1);
            } else {
                this.screen.remove(prompt);
                this.screen.render();
                return value;
            }
        });


    }

    writeLine(text: string) {
        const popup = Blessed.message({
            parent: this.screen,
            border: 'line',
            height: 'shrink',
            width: 'half',
            top: 'center',
            left: 'center',
            fg: 'white',
            bg: 'black',
            content: text,
            tags: true,
            keys: true,
            vi: true
        });

        popup.display(text, 0, (err: any) => {
            if (err) {
                console.error(err);
                return process.exit(1);
            } else {
                this.screen.remove(popup);
                this.screen.render();
            }
        });
    }


}