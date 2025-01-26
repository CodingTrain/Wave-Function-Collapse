class Cell {
  constructor(value) {
    // Initialize the cell as not collapsed
    this.collapsed = false;
    // Is an array passed in?
    if (value instanceof Array) {
      // Set options to the provided array
      this.options = value;
    } else {
      // Fill array with all the options
      this.options = [];
      for (let i = 0; i < value; i++) {
        this.options[i] = i;
      }
    }
  }
}
