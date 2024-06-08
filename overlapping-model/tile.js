class Tile {
  constructor(img, i) {
    this.img = img;
    this.index = i;

    this.freq = 1;

    this.left = [];
    this.right = [];
    this.top = [];
    this.bottom = [];
  }
}

class ImageHolder {
  constructor(pixels, width, height) {
    this.pixels = pixels;
    this.width = width;
    this.height = height;

    this.repr = JSON.stringify(pixels);
  }
}
