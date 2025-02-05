
let tiles = []
let grid = []

const DIM = 25

let paintReady = false
let updateRadiusSquared = 100

function reset() {
  tiles = []
  grid = []

  paintReady = false
  updateRadiusSquared = 64
}

function setup() {
  createCanvas(600, 600)
  createUI()
}

function start() {
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  }
  gridHistory = [grid]
  rewindDepth = minRewind
  maxHistory = 0
    

  paintReady = true
  loop()
}

function mouseClicked(event) {
  logCellOptions()
}

function draw() {
  background(0);

  if (drawTileOptions())
    return

  if (drawEdges())
    return

  drawGrid()

  if (!paintReady)
    return

  paintReady = false

  if (!collapseLowestEntropy())
    return

  decreaseRewind()

  paintReady = true
}

function drawGrid() {
  const w = width / DIM;
  const h = height / DIM;
  noFill();
  stroke(51);
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid[i + j * DIM];
      if (cell != undefined && cell.collapsed) {
        let index = cell.options.first_value()
        image(tiles[index].img, i * w, j * h, w, h);
      } else {
        rect(i * w, j * h, w, h);
      }
    }
  }
}

function collapseLowestEntropy() {
  // Build an array of all cells with the lowest entropy
  let lowestEntropy = 10000000;
  let lowestIndexes= [];

  for (let i = 0; i < grid.length; i++) {
    let cell = grid[i];
    if (cell.collapsed)
      continue
    let entropy = cell.options.size()
    if (entropy < lowestEntropy) {
      lowestIndexes = [i]
      lowestEntropy = entropy
    }
    else if (entropy == lowestEntropy) {
      lowestIndexes.push(i)
    }
  }

  // No lowest entropy means all cells are collapsed
  // we are done with the WFC
  if (lowestIndexes.length == 0) {
    noLoop()
    return false
  }

  // If the lowest entropy is zero, it means there is a cell
  // wihtout any option left, we reached a contraction, so
  // rewind history and try again.
  if (lowestEntropy <= 0) {
    rewindHistory()
    return false
  }

  // Pick a random cell with lowest entropy.
  let chosenCellIndex = random(lowestIndexes)

  // Make sure to update the grid now because the cell options
  // might not be up-to-date due to the propagation distance limit
  updateGrid(chosenCellIndex)

  if (!grid[chosenCellIndex].collapse()) {
    rewindHistory()
    return false
  }

  return true
}

function updateCell(index) {
  let cell = grid[index]
  if (cell.collapsed) {
    return cell
  }

  let options = new Bitmap()
  let otherOptions = new Bitmap()

  options.in_place_union(cell.options)
  {
    if (index >= DIM) {
      let upIndex = index - DIM;
      up = grid[upIndex]
      otherOptions.clear()
      for (let option of up.options) {
        otherOptions.in_place_union(tiles[option].down)
      }
      options.in_place_intersection(otherOptions)
    }
  }

  {
    if (index < grid.length - DIM) {
      let downIndex = index + DIM;
      down = grid[downIndex]
      otherOptions.clear()
      for (let option of down.options) {
        otherOptions.in_place_union(tiles[option].up)
      }
      options.in_place_intersection(otherOptions)
    }
  }

  {
    if (index % DIM != 0) {
      let leftIndex = index - 1;
      left = grid[leftIndex]
      otherOptions.clear()
      for (let option of left.options) {
        otherOptions.in_place_union(tiles[option].right)
      }
      options.in_place_intersection(otherOptions)
    }
  }

  {
    let rightIndex = index + 1;
    if (rightIndex % DIM != 0) {
      right = grid[rightIndex]
      otherOptions.clear()
      for (let option of right.options) {
        otherOptions.in_place_union(tiles[option].left)
      }
      options.in_place_intersection(otherOptions)
    }
  }

  return new Cell(options)
}

function updateGrid(pickedIndex) {
  let pickedX = pickedIndex % DIM
  let pickedY = int(floor(pickedIndex / DIM))

  const nextGrid = grid.slice();
  for (let index = 0; index < grid.length; index++) {
    {
      let x = index % DIM
      let y = int(floor(index / DIM))
      let dx = x - pickedX
      let dy = y - pickedY
  
      let distSq = dx *dx + dy * dy
      if (distSq > updateRadiusSquared)
        continue
    }
  
    nextGrid[index] = updateCell(index)
  }

  gridHistory.push(nextGrid)
  grid = nextGrid;
}
