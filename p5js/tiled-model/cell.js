class Cell {
  constructor(value) {
    // Initialize the cell as not collapsed
    this.collapsed = false;
    // Is an array passed in?
    if (value instanceof Set) {
      // Set options to the provided array
      this.options = value;
    } else {
      // Fill set with all the options
      this.options = new Set();
      for (let i = 0; i < value; i++) {
        this.options.add(i);
      }
    }
  }
}
