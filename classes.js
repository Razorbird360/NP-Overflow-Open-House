export class character_controller {
    constructor(animations) {
        this.input = new controller_input();
        this.fsm = new finite_state_machine();
    }
}

export class controller_input {
    constructor() {
        this.init();
    }

    init() {
        this.keys = {
            forward : false,
            backward : false,
            left : false,
            right : false,
            shift : false
        }

        document.addEventListener('keydown', (e) => this.keydown(e), false);
        document.addEventListener('keydown', (e) => this.keyup(e), false);
    }

    keydown(event) {
        switch (event.key) {
            case 'w':
                this.keys.forward = true;
                break;
            case 's':
                this.keys.backward = true;
                break;
            case 'a':
                this.keys.left = true;
                break;
            case 'd':
                this.keys.right = true;
                break;
            case 'Shift':
                this.keys.shift = true;
                break;
        }
    }

    keyup(event) {
        switch (event.key) {
            case 'w':
                this.keys.forward = false;
                break;
            case 's':
                this.keys.backward = false;
                break;
            case 'a':
                this.keys.left = false;
                break;
            case 'd':
                this.keys.right = false;
                break;
            case 'Shift':
                this.keys.shift = false;
                break;
        }
    }
}

export class finite_state_machine {
    constructor() {
        this.states = {};
        this.current_state = null;
    }

    addstate(name, state) {
        this.states[name] = state;
    }

    setstate(name) {
        const prevstate = this.current_state;
        
        //clears previous state
        if (prevstate) {
            if (prevstate.name === name) {
                return;
            }
            prevstate.Exit();
        }
    }
}