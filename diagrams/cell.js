class Cell {
  constructor(tiles, x, y, w, index) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.index = index;
    this.options = [];
    this.collapsed = false;
    this.checked = false;
    for (let i = 0; i < tiles.length; i++) {
      this.options.push(i);
    }
  }

  show() {
    if (this.options.length == 0) {
      fill(255, 0, 255);
      square(this.x, this.y, this.w);
      return true;
    } else if (this.collapsed) {
      let tileIndex = this.options[0];
      let img = tiles[tileIndex].img;
      renderCell(img, this.x, this.y, this.w);
    } else {
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      for (let i = 0; i < this.options.length; i++) {
        let tileIndex = this.options[i];
        let img = tiles[tileIndex].img;
        // (1 + 1 * 3) * 4
        sumR += img.pixels[16]; // if 3x3 tile!!
        sumG += img.pixels[17];
        sumB += img.pixels[18];
      }
      sumR /= this.options.length;
      sumG /= this.options.length;
      sumB /= this.options.length;
      fill(sumR, sumG, sumB);
      square(this.x, this.y, this.w);
      // fill(0);
      // noStroke();
      // textSize(this.w / 2);
      // textAlign(CENTER, CENTER);
      // text(this.options.length, this.x + this.w / 2, this.y + this.w / 2);
    }
  }
}
