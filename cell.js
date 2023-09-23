class Cell {
  constructor(i, j, value) {
    this.i = i;
    this.j = j;
    if (value instanceof Array) {
      this.options = value;
    } else {
      this.options = [];
      for (let i = 0; i < value; i++) {
        this.options[i] = i;
      }
    }
    this.collapsed = this.options.length == 1;
  }

  draw(w, h) {
    if (this.collapsed) {
      let index = this.options[0];
      image(tiles[index].img, this.i * w, this.j * h, w, h);
    } else {
      noFill();
      stroke(51);
      rect(this.i * w, this.j * h, w, h);
    }
  }

  validOptions(dir) {
    let validOptions = new Set();
    for (let option of this.options) {
      let valid = tiles[option].compatibles(dir);
      for (let opt of valid) {
        validOptions.add(opt);
      }
    }

    return validOptions;
  }
}
