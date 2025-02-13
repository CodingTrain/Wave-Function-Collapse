
let tiles = []
let grid = []
const contradictions = []
const updateOtherOptions = new Bitmap()

const DIM = 40

let paintReady = false
let loadFreq = 20
let loadCount = 0
let updateRadiusSquared = 10000

function setup() {
  createCanvas(600, 600)
  reset()
  createUI()
}

function reset() {
  background(0)
  tiles = []
  clearGrid()
  clearContradictions()
  paintReady = false
}

function clearContradictions() {
  for (let i = 0; i < DIM * DIM; i++) {
    contradictions[i] = 0
  }
}

function clearGrid() {
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length)
  }
}

function start() {
  background(0)
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length)
    contradictions[i] = 0
  }
  gridHistory = [grid]
  rewindDepth = minRewind
  maxHistory = 0

  paintReady = true
  loop()
}

function mouseClicked(event) {
  logCellOptionsUnderMouse()
}

function draw() {
  if (drawTileOptions())
    return

  if (drawEdges())
    return

  loading_progress = is_loading_done()
  if (loading_progress != undefined) {
    if (frameRate > 4)
      loadFreq = frameRate / 4
    if (loadCount++ % loadFreq != 0)
      return

    background(0)
    fill(240)
    textSize(32)
    text(loading_progress, 20, height/2 - 32)
    return
  }

  drawGrid()

  if (!paintReady)
    return

  paintReady = false

  if (!collapseLowestEntropy())
    return

  decreaseRewind()

  paintReady = true
}
