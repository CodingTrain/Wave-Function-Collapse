class Tile {
  constructor(img, edges) {
    this.img = img;
    this.edges = edges;
    this.up = [];
    this.right = [];
    this.down = [];
    this.left = [];
  }

  analyze(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];
      // UP
      if (tile.edges[2] == this.edges[0]) {
        this.up.push(i);
      }
      // RIGHT
      if (tile.edges[3] == this.edges[1]) {
        this.right.push(i);
      }
      // DOWN
      if (tile.edges[0] == this.edges[2]) {
        this.down.push(i);
      }
      // LEFT
      if (tile.edges[1] == this.edges[3]) {
        this.left.push(i);
      }
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
    return new Tile(newImg, newEdges);
  }
}
