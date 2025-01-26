// Reverse a string
function reverseString(s) {
  let arr = s.split('');
  arr = arr.reverse();
  return arr.join('');
}

// Compare if one edge matches the reverse of another
function compareEdge(a, b) {
  return a == reverseString(b);
}

// Class for each tile
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

  // Analyze and find matching edges with other tiles
  analyze(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];

      // Skip if both tiles are tile 5
      if (tile.index == 5 && this.index == 5) continue;

      // Check if the current tile's bottom edge matches this tile's top edge
      if (compareEdge(tile.edges[2], this.edges[0])) {
        this.up.push(i);
      }
      // Check if the current tile's left edge matches this tile's right edge
      if (compareEdge(tile.edges[3], this.edges[1])) {
        this.right.push(i);
      }
      // Check if the current tile's top edge matches this tile's bottom edge
      if (compareEdge(tile.edges[0], this.edges[2])) {
        this.down.push(i);
      }
      // Check if the current tile's right edge matches this tile's left edge
      if (compareEdge(tile.edges[1], this.edges[3])) {
        this.left.push(i);
      }
    }
  }

  // Rotate the tile image and edges
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
