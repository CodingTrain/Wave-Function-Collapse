
let tiles = []
let grid = []

const DIM = 25

let paintReady = false
let updateRadiusSquared = 64

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

function draw() {
  if (!paintReady)
    return

  background(0);

  // drawEdges()
  // return

  if (drawTileOptions())
    return

  paintReady = false

  drawGrid()

  let pickedIndex = collapseLowestEntropy()
  if (pickedIndex < 0)
    return

  updateGrid(pickedIndex)

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
      if (cell.collapsed) {
        let index = cell.options.keys().next().value;
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
    let entropy = cell.options.size
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
    return -1
  }

  // If the lowest entropy is zero, it means there is a cell
  // wihtout any option left, we reached a contraction, so
  // rewind history and try again.
  if (lowestEntropy <= 0) {
    rewindHistory()
    return -1
  }

  // Pick a random cell with lowest entropy.
  let chosenIndex = random(lowestIndexes)
  updateGrid(chosenIndex)
  cell = grid[chosenIndex]
  if (cell.options.size == 0) {
    rewindHistory()
    return -1
  }

  // Collapse the cell to one of its tile options.
  const pick = floor(random(cell.options.size))
  let optionsArr = Array.from(cell.options)
  let pickedIndex = optionsArr[pick]

  cell.collapsed = true;
  cell.options = new Set();
  cell.options.add(pickedIndex)

  return pickedIndex
}

function updateCell(index) {
  let cell = grid[index]
  if (cell.collapsed) {
    return cell
  }

  let options = new Set(cell.options.keys())
  {
    if (index >= DIM) {
      let upIndex = index - DIM;
      up = grid[upIndex]
      upOptions = new Set()
      for (let option of up.options) {
        upOptions = upOptions.union(tiles[int(option)].down)
        if (upOptions.size == tiles.length) {
          break
        }
      }
      options = options.intersection(upOptions)
    }
  }

  {
    if (index < grid.length - DIM) {
      let downIndex = index + DIM;
      down = grid[downIndex]
      downOptions = new Set()
      for (let option of down.options) {
        downOptions = downOptions.union(tiles[int(option)].up)
        if (downOptions.size == tiles.length) {
          break
        }
      }
      options = options.intersection(downOptions)
    }
  }

  {
    if (index % DIM != 0) {
      let leftIndex = index - 1;
      left = grid[leftIndex]
      leftOptions = new Set()
      for (let option of left.options) {
        leftOptions = leftOptions.union(tiles[int(option)].right)
        if (leftOptions.size == tiles.length) {
          break
        }
      }
      options = options.intersection(leftOptions)
    }
  }

  {
    let rightIndex = index + 1;
    if (rightIndex % DIM != 0) {
      right = grid[rightIndex]
      rightOptions = new Set()
      for (let option of right.options) {
        rightOptions = rightOptions.union(tiles[int(option)].left)
        if (rightOptions.size == tiles.length) {
          break
        }
      }
      options = options.intersection(rightOptions)
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
