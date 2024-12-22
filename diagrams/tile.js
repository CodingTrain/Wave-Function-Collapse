const TRIGHT = 0;
const TLEFT = 1;
const TUP = 2;
const TDOWN = 3;

class Tile {
  constructor(img, i) {
    this.img = img;
    this.img.loadPixels();
    this.index = i;
    this.neighbors = [];
    this.neighbors[TRIGHT] = [];
    this.neighbors[TLEFT] = [];
    this.neighbors[TUP] = [];
    this.neighbors[TDOWN] = [];
  }

  calculateNeighbors(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      if (this.overlapping(tiles[i], TRIGHT)) {
        this.neighbors[TRIGHT].push(i);
      }
      if (this.overlapping(tiles[i], TLEFT)) {
        this.neighbors[TLEFT].push(i);
      }
      if (this.overlapping(tiles[i], TUP)) {
        this.neighbors[TUP].push(i);
      }
      if (this.overlapping(tiles[i], TDOWN)) {
        this.neighbors[TDOWN].push(i);
      }
    }
  }

  overlapping(other, direction) {
    if (direction == TRIGHT) {
      for (let i = 1; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          let indexA = (i + j * 3) * 4;
          let indexB = (i - 1 + j * 3) * 4;
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    } else if (direction == TLEFT) {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          let indexA = (i + j * 3) * 4;
          let indexB = (i + 1 + j * 3) * 4;
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    } else if (direction == TUP) {
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 3; i++) {
          let indexA = (i + j * 3) * 4;
          let indexB = (i + (j + 1) * 3) * 4;
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    } else if (direction == TDOWN) {
      for (let j = 1; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
          let indexA = (i + j * 3) * 4;
          let indexB = (i + (j - 1) * 3) * 4;
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    }
  }
}

function differentColor(imgA, indexA, imgB, indexB) {
  let rA = imgA.pixels[indexA + 0];
  let gA = imgA.pixels[indexA + 1];
  let bA = imgA.pixels[indexA + 2];
  let rB = imgB.pixels[indexB + 0];
  let gB = imgB.pixels[indexB + 1];
  let bB = imgB.pixels[indexB + 2];
  return rA !== rB || gA !== gB || bA !== bB;
}
