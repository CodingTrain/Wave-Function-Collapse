let tiles = [];
const tileImages = [];
let grid = [];

const DIM = 25;
const NB_UPDATES_PER_TICK=5;

function preload() {
  // const path = 'rail';
  // for (let i = 0; i < 7; i++) {
  //   tileImages[i] = loadImage(`${path}/tile${i}.png`);
  // }

  const path = 'tiles/circuit-coding-train';
  for (let i = 0; i < 13; i++) {
    tileImages[i] = loadImage(`${path}/${i}.png`);
  }
}

function removeDuplicatedTiles(tiles) {
  const uniqueTilesMap = {};
  for (const tile of tiles) {
    const key = tile.edges.join(','); // ex: 'ABB,BCB,BBA,AAA'
    uniqueTilesMap[key] = tile;
  }
  return Object.values(uniqueTilesMap);
}

function setup() {
  createCanvas(400, 400);
  //randomSeed(15);

  // tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  // tiles[1] = new Tile(tileImages[1], ['ABA', 'ABA', 'ABA', 'AAA']);
  // tiles[2] = new Tile(tileImages[2], ['BAA', 'AAB', 'AAA', 'AAA']);
  // tiles[3] = new Tile(tileImages[3], ['BAA', 'AAA', 'AAB', 'AAA']);
  // tiles[4] = new Tile(tileImages[4], ['ABA', 'ABA', 'AAA', 'AAA']);
  // tiles[5] = new Tile(tileImages[5], ['ABA', 'AAA', 'ABA', 'AAA']);
  // tiles[6] = new Tile(tileImages[6], ['ABA', 'ABA', 'ABA', 'ABA']);

  // Loaded and created the tiles
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

  for (let i = 0; i < 12; i++) {
    tiles[i].index = i;
  }

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

  // Generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  startOver();
}

function startOver() {
  // Create cell for each spot on the grid
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(i % DIM, floor(i / DIM), tiles.length);
  }
}

function checkValid(arr, valid) {
  //console.log(arr, valid);
  for (let i = arr.length - 1; i >= 0; i--) {
    // VALID: [BLANK, RIGHT]
    // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
    // result in removing UP, DOWN, LEFT
    let element = arr[i];
    // console.log(element, valid.includes(element));
    if (!valid.has(element)) {
      arr.splice(i, 1);
    }
  }
  // console.log(arr);
  // console.log("----------");
}

function mousePressed() {
  redraw();
}

function draw() {
  background(0);

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
    // console.table(grid);
    // console.table(gridCopy);

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

    grid = optimizedNextGrid(cell);
  }
}

// propagate options from src to dest. If dest is above src, dir == UP.
function propagate(src, dest, dir) {
  let oldLen = dest.options.length;
  checkValid(dest.options, src.validOptions(dir));
  return oldLen != dest.options.length;
}

function optimizedNextGrid(pick) {
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
