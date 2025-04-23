// Source image
let sourceImage;
// Tiles extracted from the source image
let tiles;
// Grid of cells for the Wave Function Collapse algorithm
let grid;

// Refactored variables names
// Number of cells along one dimension of the grid
let GRID_SIZE = 100;
// Maximum depth for recursive checking of cells
let MAX_RECURSION_DEPTH = 1000;
// Size of each tile (3x3 by default)
let TILE_SIZE = 3;
let w;

// Turn on or off rotations and reflections
const ROTATIONS = false;
const REFLECTIONS = false;

function preload() {
  sourceImage = loadImage('images/flowers.png');
}

function setup() {
  createCanvas(800, 800);
  // Cell width based on canvas size and grid size
  w = width / GRID_SIZE;

  // Extract tiles and calculate their adjacencies
  tiles = extractTiles(sourceImage);
  for (let tile of tiles) {
    tile.calculateNeighbors(tiles);
  }

  // Create the grid
  initializeGrid();

  // Perform initial wave function collapse step
  wfc();

  // The WFC function only collapses one cell at a time
  // This extra bit collapses any other cells that can be
  for (let cell of grid) {
    if (cell.options.length == 1) {
      cell.collapsed = true;
      reduceEntropy(grid, cell, 0);
    }
  }
  // add pause checkbox
  let pauseCheckbox = createCheckbox('Pause', false);
  pauseCheckbox.changed(() => {
    if (pauseCheckbox.checked()) {
      noLoop();
    } else {
      loop();
    }
  });
}

function initializeGrid() {
  // Clear the background
  background(0);

  // Clear the grid
  grid = [];
  // Initialize the grid with cells
  let count = 0;
  for (let j = 0; j < GRID_SIZE; j++) {
    for (let i = 0; i < GRID_SIZE; i++) {
      grid.push(new Cell(tiles, i * w, j * w, w, count));
      count++;
    }
  }

}

function draw() {
  // Run Wave Function Collapse
  wfc();

  // Show the grid
  for (let i = 0; i < grid.length; i++) {
    // Draw each cell
    grid[i].show();

    // Reset all cells to "unchecked"
    grid[i].checked = false;
  }
}

// The Wave Function Collapse algorithm
function wfc() {
  // Calculate entropy for each cell
  for (let cell of grid) {
    cell.calculateEntropy();
  }

  // Find cells with the lowest entropy (simplified as fewest options left)
  // Thie refactored method to find the lowest entropy cells avoids sorting
  let minEntropy = Infinity;
  let lowestEntropyCells = [];

  for (let cell of grid) {
    if (!cell.collapsed) {
      if (cell.entropy < minEntropy) {
        minEntropy = cell.entropy;
        lowestEntropyCells = [cell];
      } else if (cell.entropy === minEntropy) {
        lowestEntropyCells.push(cell);
      }
    }
  }

  // We're done if all cells are collapsed!
  if (lowestEntropyCells.length == 0) {
    noLoop();
    return;
  }

  // Randomly select one of the lowest entropy cells to collapse
  const cell = random(lowestEntropyCells);
  cell.collapsed = true;

  // Need to redraw this cell
  cell.needsRedraw = true;

  // Choose one option randomly from the cell's options
  const pick = random(cell.options);

  // If there are no possible tiles that fit there!
  if (pick == undefined) {
    console.log('ran into a conflict');
    initializeGrid();
    return;
  }

  // Set the final tile
  cell.options = [pick];

  // Propagate entropy reduction to neighbors
  reduceEntropy(grid, cell, 0);

  // Collapse anything that can be!
  for (let cell of grid) {
    if (cell.options.length == 1) {
      cell.collapsed = true;
      reduceEntropy(grid, cell, 0);
    }
  }
}

function reduceEntropy(grid, cell, depth) {
  // Stop propagation if max depth is reached or cell already checked
  if (depth > MAX_RECURSION_DEPTH) return;

  // Mark cell as checked
  cell.checked = true;

  // Need to redraw this cell
  cell.needsRedraw = true;

  let index = cell.index;
  let i = floor(index % GRID_SIZE);
  let j = floor(index / GRID_SIZE);

  // Update neighboring cells based on adjacency rules
  // RIGHT
  if (i + 1 < GRID_SIZE) {
    let rightCell = grid[i + 1 + j * GRID_SIZE];
    if (checkOptions(cell, rightCell, EAST)) {
      reduceEntropy(grid, rightCell, depth + 1);
    }
  }

  // LEFT
  if (i - 1 >= 0) {
    let leftCell = grid[i - 1 + j * GRID_SIZE];
    if (checkOptions(cell, leftCell, WEST)) {
      reduceEntropy(grid, leftCell, depth + 1);
    }
  }

  // DOWN
  if (j + 1 < GRID_SIZE) {
    let downCell = grid[i + (j + 1) * GRID_SIZE];
    if (checkOptions(cell, downCell, SOUTH)) {
      reduceEntropy(grid, downCell, depth + 1);
    }
  }

  // UP
  if (j - 1 >= 0) {
    let upCell = grid[i + (j - 1) * GRID_SIZE];
    if (checkOptions(cell, upCell, NORTH)) {
      reduceEntropy(grid, upCell, depth + 1);
    }
  }
}

function checkOptions(cell, neighbor, direction) {
  // Check if the neighbor is valid and not already collapsed
  if (neighbor && !neighbor.collapsed) {
    // Collect valid options based on the current cell's adjacency rules
    let validOptions = [];
    for (let option of cell.options) {
      validOptions = validOptions.concat(tiles[option].neighbors[direction]);
    }

    let oldOptLength = neighbor.options.length;
    // Filter the neighbor's options to retain only those that are valid
    neighbor.options = neighbor.options.filter((elt) => validOptions.includes(elt));

    if (neighbor.options.length < oldOptLength) {
      return true;
    }else{
      return false;
    }
  } else {
    return false;
  }
}
