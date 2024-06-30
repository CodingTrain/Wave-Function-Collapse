class Tile {
  constructor(img, i) {
    this.img = img;
    this.index = i;
    this.adjacents = [];
  }

  adjacancies(tiles) {
    this.adjacents[LEFT] = [];
    this.adjacents[RIGHT] = [];
    this.adjacents[UP] = [];
    this.adjacents[DOWN] = [];
    for (let t of tiles) {
      if (this.index == t.index) continue;
      if (compareHEdge(this.img, t.img, 0, 1)) {
        this.adjacents[LEFT].push(t.index);
      }
      if (compareHEdge(this.img, t.img, 1, 0)) {
        this.adjacents[RIGHT].push(t.index);
      }
      if (compareVEdge(this.img, t.img, 0, 1)) {
        this.adjacents[UP].push(t.index);
      }
      if (compareVEdge(this.img, t.img, 1, 0)) {
        this.adjacents[DOWN].push(t.index);
      }
    }
  }
}

function compareHEdge(a, b, aEdge, bEdge) {
  a.loadPixels();
  b.loadPixels();
  let same = true;

  for (j = 0; j < 2; j++) {
    for (let i = 0; i < tileSize; i++) {
      let colA = aEdge + (j % tileSize);
      let colB = bEdge + (j % tileSize);
      let aIndex = (colA + i * tileSize) * 4;
      let bIndex = (colB + i * tileSize) * 4;
      let ar = a.pixels[aIndex + 0];
      let br = b.pixels[bIndex + 0];
      let ag = a.pixels[aIndex + 1];
      let bg = b.pixels[bIndex + 1];
      let ab = a.pixels[aIndex + 2];
      let bb = b.pixels[bIndex + 2];
      if (ar != br || ag != bg || ab != bb) {
        same = false;
        break;
      }
    }
  }
  return same;
}

function compareVEdge(a, b, aEdge, bEdge) {
  a.loadPixels();
  b.loadPixels();
  let same = true;
  for (j = 0; j < 2; j++) {
    for (let i = 0; i < tileSize; i++) {
      let rowA = aEdge + (j % tileSize);
      let rowB = bEdge + (j % tileSize);
      let aIndex = (i + rowA * tileSize) * 4;
      let bIndex = (i + rowB * tileSize) * 4;
      let ar = a.pixels[aIndex + 0];
      let br = b.pixels[bIndex + 0];
      let ag = a.pixels[aIndex + 1];
      let bg = b.pixels[bIndex + 1];
      let ab = a.pixels[aIndex + 2];
      let bb = b.pixels[bIndex + 2];
      if (ar != br || ag != bg || ab != bb) {
        same = false;
        break;
      }
    }
  }
  return same;
}
