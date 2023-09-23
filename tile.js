function reverseString(s) {
  let arr = s.split('');
  arr = arr.reverse();
  return arr.join('');
}

function compatibleEdges(a, b) {
  return a == reverseString(b);
}

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

class Tile {
  constructor(img, edges, i) {
    this.img = img;
    this.edges = edges;
    this.up = [];
    this.right = [];
    this.down = [];
    this.left = [];

    if (i !== undefined) {
      this.index = i;
    }
  }

  analyze(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];

      // Tile 5 can't match itself
      if (tile.index == 5 && this.index == 5) continue;

      // UP
      if (compatibleEdges(tile.edges[DOWN], this.edges[UP])) {
        this.up.push(i);
      }
      // RIGHT
      if (compatibleEdges(tile.edges[LEFT], this.edges[RIGHT])) {
        this.right.push(i);
      }
      // DOWN
      if (compatibleEdges(tile.edges[UP], this.edges[DOWN])) {
        this.down.push(i);
      }
      // LEFT
      if (compatibleEdges(tile.edges[RIGHT], this.edges[LEFT])) {
        this.left.push(i);
      }
    }
  }

  compatibles(dir) {
    switch (dir) {
      case UP:
        return this.up;
      case RIGHT:
        return this.right;
      case DOWN:
        return this.down;
      case LEFT:
        return this.left;
    }
  }

  rotate(num) {
    const w = this.img.width;
    const h = this.img.height;
    const newImg = createGraphics(w, h);
    newImg.imageMode(CENTER);
    newImg.translate(w / 2, h / 2);
    newImg.rotate(HALF_PI * num);
    newImg.image(this.img, 0, 0);

    const newEdges = [];
    const len = this.edges.length;
    for (let i = 0; i < len; i++) {
      newEdges[i] = this.edges[(i - num + len) % len];
    }
    return new Tile(newImg, newEdges, this.index);
  }
}
