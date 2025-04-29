// Source image
let sourceImage;
// Tiles extracted from the source image
let tiles;
// Grid of cells for the Wave Function Collapse algorithm
let grid;

// Refactored variables names
// Number of cells along one dimension of the grid
let GRID_SIZE = 80;
// Maximum depth for recursive checking of cells
let MAX_RECURSION_DEPTH = 1000000000;
const REDUCTIONS_PER_FRAME = 10000;
// Size of each tile (3x3 by default)
let TILE_SIZE = 3;
let w;
let reductionQueue = [];
let chooseModelDropDown;

// Turn on or off rotations and reflections
const ROTATIONS = false;
const REFLECTIONS = false;

function preload() {
  sourceImage = loadImage('images/Flowers.png');
}

function setup() {
  createCanvas(800, 800);
  // Cell width based on canvas size and grid size
  w = width / GRID_SIZE;

  setupTiles();

  // // Perform initial wave function collapse step
  // wfc();

  // // The WFC function only collapses one cell at a time
  // // This extra bit collapses any other cells that can be
  // for (let cell of grid) {
  //   if (cell.options.length == 1) {
  //     cell.collapsed = true;
  //     reduceEntropyOnce(grid, cell, 0);
  //   }
  // }
  // add pause checkbox
  let pauseCheckbox = createCheckbox('Pause', false);
  pauseCheckbox.changed(() => {
    if (pauseCheckbox.checked()) {
      noLoop();
    } else {
      loop();
    }
  });

  chooseModelDropDown = createSelect();
  // add logic to selection
  chooseModelDropDown.changed(() => {
    // Get the selected value
    const selectedValue = chooseModelDropDown.value();
    // Load the selected image
    sourceImage = loadImage(`images/${selectedValue}`, () => {
      // Setup tiles again with the new image
      setupTiles();
    });
  });

  fetch('images/list.txt')
    .then(response => response.text())
    .then(text => {
      const images = text.split('\n').filter(name => name.trim() !== '');
      images.forEach(image => {
        chooseModelDropDown.option(image);
      });
    });
}

function setupTiles(){
  // Extract tiles and calculate their adjacencies
  tiles = extractTiles(sourceImage);
  for (let tile of tiles) {
    tile.calculateNeighbors(tiles);
  }

  // Create the grid
  initializeGrid();
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
  if (reductionQueue.length == 0) {
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

    // Changing logic to gradually reduce entropy

    // Set the final tile
    cell.options = [pick];

    // add to queue
    addToQueue(reductionQueue, cell, 0);
  }
  else {
    // Propagate entropy reduction to neighbors
    let reductionCount = 0;
    while (reductionQueue.length > 0) {
      reduceEntropyOnce(grid, reductionQueue);
      reductionCount++;
      if (reductionCount > REDUCTIONS_PER_FRAME) {
        break;
      }
    }

    // // Collapse anything that can be!
    // for (let cell of grid) {
    //   if (cell.options.length == 1) {
    //     cell.collapsed = true;
    //     addToQueue(reductionQueue, cell, 0);
    //   }
    // }
  }
}

function addToQueue(cellDepthQueueArray, cell, depth) {
  // Check if the cell is already in the queue
  for (let i = 0; i < cellDepthQueueArray.length; i++) {
    if (cellDepthQueueArray[i].cell.index == cell.index) {
      return;
    }
  }

  // Add the cell and depth to the queue
  cellDepthQueueArray.push({
    cell: cell,
    depth: depth
  });
}



function reduceEntropyOnce(grid, cellDepthQueueArray) {
  cellDepth = cellDepthQueueArray.shift();
  let cell = cellDepth.cell;
  let depth = cellDepth.depth;

  // Stop propagation if max depth is reached or cell already checked
  if (depth > MAX_RECURSION_DEPTH) return "Recursion limit reached";

  // Mark cell as checked
  cell.checked = true;

  if (cell.options.length == 1) {
    cell.collapsed = true;
  }

  // Need to redraw this cell
  cell.needsRedraw = true;

  let index = cell.index;
  let i = floor(index % GRID_SIZE);
  let j = floor(index / GRID_SIZE);

  let needsPropogation = 0;

  // Update neighboring cells based on adjacency rules
  // RIGHT
  if (i + 1 < GRID_SIZE) {
    let rightCell = grid[i + 1 + j * GRID_SIZE];
    if (checkOptionsReduced(cell, rightCell, EAST)) {
      addToQueue(cellDepthQueueArray, rightCell, depth + 1);
      needsPropogation++;
    }
  }

  // LEFT
  if (i - 1 >= 0) {
    let leftCell = grid[i - 1 + j * GRID_SIZE];
    if (checkOptionsReduced(cell, leftCell, WEST)) {
      addToQueue(cellDepthQueueArray, leftCell, depth + 1);
      needsPropogation++;
    }
  }

  // DOWN
  if (j + 1 < GRID_SIZE) {
    let downCell = grid[i + (j + 1) * GRID_SIZE];
    if (checkOptionsReduced(cell, downCell, SOUTH)) {
      addToQueue(cellDepthQueueArray, downCell, depth + 1);
      needsPropogation++;
    }
  }

  // UP
  if (j - 1 >= 0) {
    let upCell = grid[i + (j - 1) * GRID_SIZE];
    if (checkOptionsReduced(cell, upCell, NORTH)) {
      addToQueue(cellDepthQueueArray, upCell, depth + 1);
      needsPropogation++;
    }
  }

  if (needsPropogation > 0) {
    return "Need to reduce entropy";
  } else {
    return "Entropy reduced";
  }
}

function checkOptionsReduced(cell, neighbor, direction) {
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
    } else {
      return false;
    }
  } else {
    return false;
  }
}
