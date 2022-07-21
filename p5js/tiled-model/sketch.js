let tiles = [];
const tileImages = [];
let grid = [];

const DIM = 25;
const NB_UPDATES_PER_TICK=1;

function preload() {
  // Load tile images
  const path = 'tiles/circuit-coding-train';
  for (let i = 0; i < 13; i++) {
    tileImages[i] = loadImage(`${path}/${i}.png`);
  }
}

function removeDuplicatedTiles(tiles) {
  // Remove duplicated tiles based on edges
  const uniqueTilesMap = {};
  for (const tile of tiles) {
    const key = tile.edges.join(',');
    uniqueTilesMap[key] = tile;
  }
  return Object.values(uniqueTilesMap);
}

function setup() {
  createCanvas(400, 400);

  // Initialize tiles with images and edges
  tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  tiles[1] = new Tile(tileImages[1], ['BBB', 'BBB', 'BBB', 'BBB']);
  tiles[2] = new Tile(tileImages[2], ['BBB', 'BCB', 'BBB', 'BBB']);
  tiles[3] = new Tile(tileImages[3], ['BBB', 'BDB', 'BBB', 'BDB']);
  tiles[4] = new Tile(tileImages[4], ['ABB', 'BCB', 'BBA', 'AAA']);
  tiles[5] = new Tile(tileImages[5], ['ABB', 'BBB', 'BBB', 'BBA']);
  tiles[6] = new Tile(tileImages[6], ['BBB', 'BCB', 'BBB', 'BCB']);
  tiles[7] = new Tile(tileImages[7], ['BDB', 'BCB', 'BDB', 'BCB']);
  tiles[8] = new Tile(tileImages[8], ['BDB', 'BBB', 'BCB', 'BBB']);
  tiles[9] = new Tile(tileImages[9], ['BCB', 'BCB', 'BBB', 'BCB']);
  tiles[10] = new Tile(tileImages[10], ['BCB', 'BCB', 'BCB', 'BCB']);
  tiles[11] = new Tile(tileImages[11], ['BCB', 'BCB', 'BBB', 'BBB']);
  tiles[12] = new Tile(tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB']);

  // Assign index to each tile
  for (let i = 0; i < 12; i++) {
    tiles[i].index = i;
  }

  // Generate rotated versions of tiles and remove duplicates
  const initialTileCount = tiles.length;
  for (let i = 0; i < initialTileCount; i++) {
    let tempTiles = [];
    for (let j = 0; j < 4; j++) {
      tempTiles.push(tiles[i].rotate(j));
    }
    tempTiles = removeDuplicatedTiles(tempTiles);
    tiles = tiles.concat(tempTiles);
  }
  console.log(tiles.length);

  // Analyze tiles to generate adjacency rules
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  startOver();
}

function startOver() {
  // Initialize grid with cells
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(i % DIM, floor(i / DIM), tiles.length);
  }
}

function checkValid(arr, valid) {
  // Remove invalid options from array
  for (let i = arr.length - 1; i >= 0; i--) {
    let element = arr[i];
    if (!valid.has(element)) {
      arr.splice(i, 1);
    }
  }
}

function draw() {
  background(0);

  // Draw grid cells
  const w = width / DIM;
  const h = height / DIM;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      grid[posIdx(i, j)].draw(w, h);
    }
  }

  for (let idxUpdate = 0; idxUpdate < NB_UPDATES_PER_TICK; idxUpdate++) {
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
    if (pick === undefined) {
      startOver();
      return;
    }
    cell.options = [pick];

    grid = nextGrid(cell);
  }
}

// propagate options from src to dest. If dest is above src, dir == UP.
function propagate(src, dest, dir) {
  let oldLen = dest.options.length;
  checkValid(dest.options, src.validOptions(dir));
  return oldLen != dest.options.length;
}

function nextGrid(pick) {
  let touched = [posIdx(pick.i, pick.j)];

  while (touched.length > 0) {
    let cell = grid[touched.pop()];

    let check = function (i, j, dir) {
      const idx = posIdx(i, j);
      if (propagate(cell, grid[idx], dir)) {
        if (!touched.includes(idx)) {
          touched.push(idx);
        }
      }
    };

    if (cell.i > 0) {
      check(cell.i - 1, cell.j, LEFT);
    }

    if (cell.i < DIM - 1) {
      check(cell.i + 1, cell.j, RIGHT);
    }

    if (cell.j > 0) {
      check(cell.i, cell.j - 1, UP);
    }

    if (cell.j < DIM - 1) {
      check(cell.i, cell.j + 1, DOWN);
    }
  }
  return grid;
}

function posIdx(i, j) {
  return i + j * DIM;
}
