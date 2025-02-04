class Cell {
  constructor(value) {
    // Initialize the cell as not collapsed
    this.collapsed = false;
    // Is an bitmap passed in?
    if (value instanceof Bitmap) {
      // Use the provided bitmap
      this.options = value;
    } else {
      // Fill a new bitmap with all the options
      this.options = new Bitmap();
      this.options.fill(value)
    }
  }
}
