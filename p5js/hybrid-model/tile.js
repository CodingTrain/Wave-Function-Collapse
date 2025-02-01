// Class for each available tile
class Tile {
  constructor(img, edge_depth, notSelf, index) {
    this.img = img
    this.edge_depth = edge_depth
    this.notSelf = notSelf
    this.edges = []
    this.up = new Bitmap()
    this.right = new Bitmap()
    this.down = new Bitmap()
    this.left = new Bitmap()
    this.index = index
    this.frequency = 1
  }

  fillEdges(filter) {
    this.edges.push(new Edge(this.img, 0, this.edge_depth, filter).id)
    this.edges.push(new Edge(this.img, 1, this.edge_depth, filter).id)
    this.edges.push(new Edge(this.img, 2, this.edge_depth, filter).id)
    this.edges.push(new Edge(this.img, 3, this.edge_depth, filter).id)
  }

  // Analyze and find matching edges with other tiles
  analyze(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];

      if (this.notSelf && this.index == tile.index)
        continue

      // Check if the current tile's bottom edge matches this tile's top edge
      if (tile.edges[2] == this.edges[0]) {
        this.up.add(i);
      }
      // Check if the current tile's left edge matches this tile's right edge
      if (tile.edges[3] == this.edges[1]) {
        this.right.add(i);
      }
      // Check if the current tile's top edge matches this tile's bottom edge
      if (tile.edges[0] == this.edges[2]) {
        this.down.add(i);
      }
      // Check if the current tile's right edge matches this tile's left edge
      if (tile.edges[1] == this.edges[3]) {
        this.left.add(i);
      }
    }
  }

  // Create a rotated tile with rotated image
  rotate(num) {
    const w = this.img.width;
    const h = this.img.height;
    const newImg = createGraphics(w, h);
    newImg.imageMode(CENTER);
    newImg.translate(w / 2, h / 2);
    newImg.rotate(HALF_PI * num);
    newImg.image(this.img, 0, 0);

    return new Tile(newImg, this.edge_depth, this.notSelf, this.index);
  }

  // Create a flipped tile with rotated image
  flip() {
    const w = this.img.width;
    const h = this.img.height;
    const newImg = createGraphics(w, h);
    newImg.imageMode(CENTER);
    newImg.translate(w / 2, h / 2);
    newImg.scale(-1, 1);
    newImg.image(this.img, 0, 0);

    return new Tile(newImg, this.edge_depth, this.notSelf, this.index);
  }
}
