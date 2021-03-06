export default class History {
  undoItems: string[]
  redoItems: string[]

  constructor() {
    this.undoItems = [];
    this.redoItems = [];
  }

  add(data: object) {
    this.undoItems.push(JSON.stringify(data));
    this.redoItems = [];
  }

  canUndo() {
    return this.undoItems.length > 0;
  }

  canRedo() {
    return this.redoItems.length > 0;
  }

  undo(currentd: object, cb: (s: object) => void) {
    const { undoItems, redoItems } = this;
    if (this.canUndo()) {
      redoItems.push(JSON.stringify(currentd));
      cb(JSON.parse(undoItems.pop() ?? ''));
    }
  }

  redo(currentd: object, cb: (s: object) => void) {
    const { undoItems, redoItems } = this;
    if (this.canRedo()) {
      undoItems.push(JSON.stringify(currentd));
      cb(JSON.parse(redoItems.pop() ?? ''));
    }
  }
}
