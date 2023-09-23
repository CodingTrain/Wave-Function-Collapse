class Cell {
  constructor(value) {
    this.collapsed = false;
    if (value instanceof Array) {
      this.options = value;
    } else {
      this.options = [];
      for (let i = 0; i < value; i++) {
        this.options[i] = i;
      }
    }
  }
}
