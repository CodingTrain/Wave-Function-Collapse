// Source image
let sourceImage;
// Tiles extracted from the source image
let tiles;
// Grid of cells for the Wave Function Collapse algorithm
let grid;

// Refactored variables names
// Number of cells along one dimension of the grid
let GRID_SIZE = 60;
// Maximum depth for recursive checking of cells
let MAX_RECURSION_DEPTH = 1000000000;
// const REDUCTIONS_PER_FRAME = 10000;
let reductionPerFrame = 1000;
const TARGET_UPDATE_TIME_MS = 15; // Target frame rate of 60 FPS
// Size of each tile (3x3 by default)
let TILE_SIZE = 3;
let PARADOX = "paradox";
let w;

let chooseModelDropDown;
let queueLengthTextBox;
let gridCopy;
let chosenCellIndex;

let recoveringParadox = false;
let reductionQueue = [];
let shuffledOptions = [];

// Turn on or off rotations and reflections
const ROTATIONS = false;
const REFLECTIONS = false;

function preload() {
  sourceImage = loadImage('images/3Bricks.png');
}

function setup() {
  createCanvas(720, 720);
  // Cell width based on canvas size and grid size
  w = width / GRID_SIZE;

  setupTiles();

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
    // check if it is the file name ending with png
    if (selectedValue.endsWith('.png')) {
      // Load the selected image
      sourceImage = loadImage(`images/${selectedValue}`, () => {
        // Setup tiles again with the new image
        console.log(`Loading new image.`);
        setupTiles();
      });
    } else {
      setupTiles();
    }
  });

  chooseModelDropDown.option("-deafault-");

  fetch('images/list.txt')
    .then(response => response.text())
    .then(text => {
      const images = text.split('\n').filter(name => name.trim() !== '');
      images.forEach(image => {
        chooseModelDropDown.option(image);
      });
    });

  // Add restart button
  let restartButton = createButton('Restart');
  restartButton.mousePressed(() => {
    setupTiles();
  });

  // Add a textbox that will show queue length
  queueLengthTextBox = createP("Processed queue: " + reductionQueue.length);

}

function setupTiles() {
  // Extract tiles and calculate their adjacencies
  tiles = extractTiles(sourceImage);
  for (let tile of tiles) {
    tile.calculateNeighbors(tiles);
  }

  // Create the grid
  initializeGrid();

  // resetting simulation state variables
  recoveringParadox = false;
  reductionQueue = [];
  shuffledOptions = [];  

  // start the loop if not already
  loop();
}

function reInitializeGrid(gridSave) {
  grid = [];
  // Initialize the grid with cells from the saved grid
  let count = 0;
  for (let j = 0; j < GRID_SIZE; j++) {
    for (let i = 0; i < GRID_SIZE; i++) {
      let cell = new Cell(tiles, i * w, j * w, w, count);
      cell.options = gridSave[count].options;
      cell.collapsed = gridSave[count].collapsed;
      cell.needsRedraw = true;
      grid.push(cell);
      count++;
    }
  }
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

  }
}

// The Wave Function Collapse algorithm
function wfc() {
  if (reductionQueue.length == 0) {
    if (!recoveringParadox) {
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

      // copying in case something would go wrong
      chosenCellIndex = cell.index;
      gridCopy = JSON.parse(JSON.stringify(grid));
      shuffledOptions = shuffle(cell.options);
    }
    // TODO - rerun this code if we did not converge

    // Choose one option randomly from the cell's options
    const pick = shuffledOptions.pop();
    recoveringParadox = false;


    // If there are no possible tiles that fit there!
    if (pick == undefined) {
      console.log('Pick undefined: ran into a conflict');
      console.log("This should not happend if we have paradox recovery");
      // initializeGrid();
      return;
    }

    // Changing logic to gradually reduce entropy

    // Set the final tile
    let workingCell = grid[chosenCellIndex];
    workingCell.options = [pick];

    // add to queue
    addToQueue(reductionQueue, workingCell, 0);
  }
  else {
    const startTime = performance.now();
    let endTime = performance.now();

    // Propagate entropy reduction to neighbors
    let reductionCount = 0;
    while (reductionQueue.length > 0) {
      let result = reduceEntropyOnce(grid, reductionQueue);
      if (result === PARADOX) {
        reductionQueue = [];
        recoveringParadox = true;
        reInitializeGrid(gridCopy);
        break;
      }
      reductionCount++;
      endTime = performance.now();
      if (endTime - startTime >= TARGET_UPDATE_TIME_MS) {
        break;
      }
    }

    queueLengthTextBox.html(`Processed queue: ${reductionCount}`);
  }
}

function addToQueue(cellDepthQueueArray, cell, depth) {
  // TODO implment a O(1) queue for better performance
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
  // console.log("Recursion depth limit reached at " + depth);

  if (cell.options.length == 0) {
    // Ignore conflicts
    console.log("Updating cell: ran into a conflict");
    // Need to redraw this cell
    cell.needsRedraw = true;
    return PARADOX;
  }

  if (cell.options.length == 1) {
    cell.collapsed = true;
  }

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
    // TODO implement options as sets with O(min(n, k)) for intersection for faster performance
    let validOptions = [];
    for (let option of cell.options) {
      if (!tiles[option]) {
        continue;
      }
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
