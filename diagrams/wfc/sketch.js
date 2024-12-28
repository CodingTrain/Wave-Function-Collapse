let sourceImage;
let tiles;
let DIM = 40;
let maxDepth = 5;
let grid = [];

let scl = 50;
let endR, endC;

function preload() {
  sourceImage = loadImage('images/city.png');
}

function setup() {
  createCanvas(sourceImage.width * scl, sourceImage.height * scl);
  console.log(sourceImage.width, sourceImage.height);
  endR = sourceImage.height - 2;
  endC = sourceImage.width - 2;

  tiles = extractTiles(sourceImage);
  for (let tile of tiles) {
    tile.calculateNeighbors(tiles);
  }
  let w = width / DIM;
  let count = 0;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      grid.push(new Cell(tiles, i * w, j * w, w, count));
      count++;
    }
  }
  // wfc();
  frameRate(1);
}

function draw() {
  background(51);

  //renderImage(tiles[0].img, 0, 0, 10);

  renderImage(sourceImage, 0, 0, scl);

  // let w = width / DIM;
  // for (let i = 0; i < grid.length; i++) {
  //   let failed = grid[i].show();
  //   grid[i].checked = false;
  // }
  // wfc();

  let w = scl;
  let count = 0;

  // for (let j = 0; j < endR; j++) {
  //   for (let i = 0; i < endC; i++) {
  //     // let x = 20 + i * (w + 4);
  //     // let y = 10 + j * (w + 4);
  //     x = i * (w + 0);
  //     y = j * (w + 0);
  //     renderImage(tiles[count].img, x, y, w / 3);
  //     count++;
  //   }
  // }

  // renderImage(tiles[count].img, 0, 0, width / 3);
  // count++;
  // console.log(count);
  // // save("tile.png");
  // if (count > tiles.length - 1) {
  //   noLoop();
  // }

  noLoop();
}

let count = 0;

function wfc() {
  // WAVE FUNCTION COLLAPSE
  // Make a copy of grid
  let gridCopy = grid.slice();
  // Remove any collapsed cells
  gridCopy = gridCopy.filter((a) => !a.collapsed);

  // The algorithm has completed if everything is collapsed
  if (gridCopy.length == 0) {
    return;
  }

  // Pick a cell with least entropy
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  // Keep only the lowest entropy cells
  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }
  if (stopIndex > 0) gridCopy.splice(stopIndex);

  // Collapse a cell
  const cell = random(gridCopy);
  cell.collapsed = true;

  const pick = random(cell.options);
  if (pick == undefined) {
    console.log('ran into a conflict');
    noLoop();
    return;
  }
  cell.options = [pick];
  reduceEntropy(grid, cell, 0);
}

function reduceEntropy(grid, cell, depth) {
  if (depth > maxDepth) return;
  if (cell.checked) return;
  cell.checked = true;
  let index = cell.index;
  let i = floor(index % DIM);
  let j = floor(index / DIM);

  // RIGHT
  if (i + 1 < DIM) {
    let rightCell = grid[i + 1 + j * DIM];
    let checked = checkOptions(cell, rightCell, TRIGHT);
    if (checked) {
      reduceEntropy(grid, rightCell, depth + 1);
    }
  }

  // LEFT
  if (i - 1 >= 0) {
    let leftCell = grid[i - 1 + j * DIM];
    let checked = checkOptions(cell, leftCell, TLEFT);
    if (checked) {
      reduceEntropy(grid, leftCell, depth + 1);
    }
  }

  // DOWN
  if (j + 1 < DIM) {
    let downCell = grid[i + (j + 1) * DIM];
    let checked = checkOptions(cell, downCell, TDOWN);
    if (checked) {
      reduceEntropy(grid, downCell, depth + 1);
    }
  }

  // UP
  if (j - 1 >= 0) {
    let upCell = grid[i + (j - 1) * DIM];
    let checked = checkOptions(cell, upCell, TUP);
    if (checked) {
      reduceEntropy(grid, upCell, depth + 1);
    }
  }
}

function checkOptions(cell, neighbor, direction) {
  if (neighbor && !neighbor.collapsed) {
    let validOptions = [];
    for (let option of cell.options) {
      validOptions = validOptions.concat(tiles[option].neighbors[direction]);
    }
    neighbor.options = neighbor.options.filter((elt) => validOptions.includes(elt));
    return true;
  } else {
    return false;
  }
}
