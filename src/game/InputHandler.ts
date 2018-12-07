export interface KeyUpListener {
  onKeyUp(key : string) : void;
}

export default class InputHandler {
  private keyPressed : Map<string, boolean> = new Map();

  private keyUpListeners : KeyUpListener[] = [];

  constructor(keysOfInterest : Array<string>) {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    keysOfInterest.forEach(val => {
      this.keyPressed.set(val, false);
    });
  }

  addOnKeyUpListener(listener : KeyUpListener) : this {
    if (listener) {
      this.keyUpListeners.push(listener);
    }

    return this;
  }

  removeOnKeyUpListener(listener : KeyUpListener) : void {
    const index = this.keyUpListeners.indexOf(listener);

    if (index >= 0) {
      this.keyUpListeners.splice(index, 1);
    }
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
  }

  isKeyDown(key : string) {
    return this.keyPressed.has(key) && this.keyPressed.get(key);
  }

  private onKeyDown(e : KeyboardEvent) {
    return this.handleKeyEvent(e, true)
  }

  private onKeyUp(e : KeyboardEvent) {
    const cancel = this.handleKeyEvent(e, false);
    if (!cancel) {
      for(const listener of this.keyUpListeners) {
        if (listener) {
          listener.onKeyUp(e.code);
        }
      }
    }

    return cancel;
  }


  private handleKeyEvent(e : KeyboardEvent, down : boolean) : boolean {
    if (e.shiftKey || e.altKey || e.ctrlKey) {
      return true;
    }

    if (this.keyPressed.has(e.code)) {
      this.keyPressed.set(e.code, down);

      e.preventDefault();

      return false;
    }

    return true;
  }
}