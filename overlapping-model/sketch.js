let img;
let tiles = [];
let grid = [];
const tileSize = 3;
const DIM = 20;

let toggle = false;

const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;

function preload() {
  img = loadImage('water.png');
}

function setup() {
  createCanvas(400, 400);
  randomSeed(1);
  extractTiles(img);
  for (let t of tiles) {
    t.adjacancies(tiles);
  }
  startOver();
  wfc();
}

function copyWrap(source, destination, sx, sy, w, h) {
  source.loadPixels();
  destination.loadPixels();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let px = (sx + x) % source.width;
      let py = (sy + y) % source.height;
      let index = (px + py * source.width) * 4;
      let dIndex = (x + y * w) * 4;
      destination.pixels[dIndex + 0] = source.pixels[index + 0];
      destination.pixels[dIndex + 1] = source.pixels[index + 1];
      destination.pixels[dIndex + 2] = source.pixels[index + 2];
      destination.pixels[dIndex + 3] = source.pixels[index + 3];
    }
  }
  destination.updatePixels();
}

function extractTiles(img) {
  const w = img.width;
  const h = img.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let pattern = createImage(tileSize, tileSize);
      copyWrap(img, pattern, x, y, tileSize, tileSize);
      // pattern.copy(img, x, y, tileSize, tileSize, 0, 0, tileSize, tileSize);
      tiles.push(new Tile(pattern, tiles.length));
    }
  }
}

function startOver() {
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length, i);
  }
}

function draw() {
  // frameRate(1);
  // draw all the extracted tiles
  background(0);

  // draw everything
  const w = width / DIM;
  const h = height / DIM;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid[i + j * DIM];
      cell.checked = false;

      if (cell.collapsed) {
        let index = cell.options[0];
        if (mouseIsPressed) {
          renderTile(tiles[index].img, i * w, j * h, w, h);
        } else {
          renderCenter(tiles[index].img, i * w, j * h, w, h);
        }
      } else {
        fill(255, 100);
        stroke(51);
        rect(i * w, j * h, w, h);
        //let txt = cell.options.join(' ');
        let txt = cell.options.length;
        if (txt.length == 0) {
          console.log('No options left!');
        }
        fill(255);
        noStroke();
        textSize(w / 2);
        text(txt, i * w + 2, j * h, w, h);
        if (cell.options.length == 0) {
          fill(255, 0, 0, 100);
          noStroke();
          rect(i * w, j * h, w, h);
        }
      }
    }
  }

  wfc();

  // showAllTiles();
  // renderTile(tiles[0].img, 0, 100, width / DIM, height / DIM);
}

function showAllTiles() {
  let x = 0;
  let y = 0;
  const w = width / DIM;
  const h = height / DIM;

  for (let i = 0; i < tiles.length; i++) {
    let x = w * (i % 4);
    let y = h * floor(i / 4);

    renderTile(tiles[i].img, x, y, w, h);
  }
}

// function mousePressed() {
//   redraw();
// }

function reduce(cell, tiles) {
  const x = cell.index % DIM;
  const y = floor(cell.index / DIM);
  if (cell.checked) return;
  cell.checked = true;

  // RIGHT
  if (x + 1 < DIM) {
    let rightCell = grid[x + 1 + y * DIM];
    if (rightCell !== undefined && !rightCell.collapsed) {
      let validOptions = [];
      for (let i of cell.options) {
        validOptions = validOptions.concat(tiles[i].adjacents[RIGHT]);
      }
      // only validOptions that are already in rightCell.options can stay
      rightCell.options = rightCell.options.filter((x) => validOptions.includes(x));
      reduce(rightCell, tiles);
    }
  }

  // LEFT
  if (x - 1 >= 0) {
    let leftCell = grid[x - 1 + y * DIM];
    if (leftCell !== undefined && !leftCell.collapsed) {
      let validOptions = [];
      for (let i of cell.options) {
        validOptions = validOptions.concat(tiles[i].adjacents[LEFT]);
      }
      // only validOptions that are already in leftCell.options can stay
      leftCell.options = leftCell.options.filter((x) => validOptions.includes(x));
      reduce(leftCell, tiles);
    }
  }

  // UP
  if (y - 1 >= 0) {
    let upCell = grid[x + (y - 1) * DIM];
    if (upCell !== undefined && !upCell.collapsed) {
      let validOptions = [];
      for (let i of cell.options) {
        validOptions = validOptions.concat(tiles[i].adjacents[UP]);
      }
      // only validOptions that are already in upCell.options can stay
      upCell.options = upCell.options.filter((x) => validOptions.includes(x));
      reduce(upCell, tiles);
    }
  }

  // DOWN
  if (y + 1 < DIM) {
    let downCell = grid[x + (y + 1) * DIM];
    if (downCell !== undefined && !downCell.collapsed) {
      let validOptions = [];
      for (let i of cell.options) {
        validOptions = validOptions.concat(tiles[i].adjacents[DOWN]);
      }
      // only validOptions that are already in downCell.options can stay
      downCell.options = downCell.options.filter((x) => validOptions.includes(x));
      reduce(downCell, tiles);
    }
  }
}

function wfc() {
  // Pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);
  if (gridCopy.length == 0) {
    return;
  }
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }
  if (stopIndex > 0) gridCopy.splice(stopIndex);

  const cell = random(gridCopy);
  cell.collapsed = true;
  const pick = random(cell.options);
  // if (pick === undefined) {
  //   // startOver();
  //   noLoop();
  //   return;
  // }
  cell.options = [pick];
  // Propogate restrictions
  reduce(cell, tiles);

  // noLoop();
}

function renderCenter(pattern, x, y, w, h) {
  pattern.loadPixels();
  // hardcoding center pixel
  let i = 1;
  let j = 1;
  let index = (i + j * tileSize) * 4;
  const r = pattern.pixels[index + 0];
  const g = pattern.pixels[index + 1];
  const b = pattern.pixels[index + 2];
  fill(r, g, b);
  noStroke();
  rect(x, y, w, h);
}

function renderTile(pattern, x, y, w, h) {
  pattern.loadPixels();
  for (let i = 0; i < tileSize; i++) {
    for (let j = 0; j < tileSize; j++) {
      let index = (i + j * tileSize) * 4;
      const r = pattern.pixels[index + 0];
      const g = pattern.pixels[index + 1];
      const b = pattern.pixels[index + 2];
      fill(r, g, b);
      noStroke();
      rect(x + (i * w) / tileSize, y + (j * h) / tileSize, w / tileSize, h / tileSize);
    }
  }
  stroke(255, 0, 0);
  noFill();
  rect(x, y, w, h);
}
