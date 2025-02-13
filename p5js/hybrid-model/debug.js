 
// DEBUG: show edges
let isDrawEdgesEnabled = false

function enableDrawEdges(enable) {
  isDrawEdgesEnabled = enable
}

function drawEdges() {
  if (!isDrawEdgesEnabled)
    return false

  if (edges == undefined)
    return true

  if (isSmoothDrawingEnabled)
    smooth()
  else
    noSmooth()

  background(0)

  let spacing = 10

  let sizes = edges.map(function(edge) {
    return max(edge.img.width, edge.img.height)
  })
  let size = min(48, max(24, max(sizes)))

  let x = spacing
  let y = spacing

  for (let edge of edges) {
    let w = 4
    let h = 4
    if (edge.img.width > 1)
      w = size
    else
      h = size

    image(edge.img, x, y, w, h)

    fill(200, 50, 50)
    rect(x + size + 4, y - 3, spacing - 8, size + 6)

    x += size + spacing
    if (x > width - size) {
      x = spacing
      y += size + spacing
    }
  }
  
  return true
}

// DEBUG: show options of a tile
let drawnTileIndex = 0
let isTileOptionsEnabled = false

function enableDrawTileOptions(enable) {
  isTileOptionsEnabled = enable
}

function changeDrawnTileOptions(amount) {
  if (tiles != undefined && tiles.length > 0) {
    drawnTileIndex = (drawnTileIndex + tiles.length + amount) % tiles.length
  }
}

function drawTileOptions() {
  if (!isTileOptionsEnabled)
    return false

  if (tiles == undefined || tiles.length == 0)
    return true

  if (isSmoothDrawingEnabled)
    smooth()
  else
    noSmooth()

  background(0)

  drawnTileIndex = (drawnTileIndex + tiles.length) % tiles.length

  const w = width / DIM
  const h = height / DIM

  const spacing = 6

  let x = width/2 - w*2
  let y = height/2 - h*2

  fill(240, 240, 240)

  let tile = tiles[drawnTileIndex]
  rect(x-1, y-1, w*4+2, h*4+2)
  image(tile.img, x, y, w*4, h*4)

  textFont(textFont(), 20)
  text(`x ${tile.frequency}`, x + w + spacing, y + h + spacing)

  x = width/2 + w*2 + spacing
  y = height/2 - h*2
  for (let otherIndex of tile.right) {
    let other = tiles[otherIndex]
    rect(x-1, y-1, w+2, h+2)
    image(other.img, x, y, w, h)

    x += w + spacing
    if (x > width - w) {
      x = width/2 + w*2 + spacing
      y += h + spacing
    }
  }

  x = width/2 - w*2
  y = height/2 - h*2
  for (let otherIndex of tile.left) {
    x -= w + spacing
    let other = tiles[otherIndex]
    rect(x-1, y-1, w+2, h+2)
    image(other.img, x, y, w, h)

    if (x < w + spacing) {
      x = width/2 - w*2
      y += h + spacing 
    }
  }

  x = width/2 - w*2
  y = height/2 - h*2
  for (let otherIndex of tile.up) {
    y -= h + spacing
    let other = tiles[otherIndex]
    rect(x-1, y-1, w+2, h+2)
    image(other.img, x, y, w, h)

    if (y < h + spacing) {
      x += w + spacing
      y = height/2 - h*2
    }
  }

  x = width/2 - w*2
  y = height/2 + h*2 + spacing
  for (let otherIndex of tile.down) {
    let other = tiles[otherIndex]
    rect(x-1, y-1, w+2, h+2)
    image(other.img, x, y, w, h)

    y += h + spacing
    if (y > height - h) {
      x += w + spacing
      y = height/2 + h*2 + spacing
    }
  }

  return true
}

// DEBUG: show options of a clicked cell
let isLogCellOptionsEnabled = false

function enableLogCellOptions(enabled) {
  isLogCellOptionsEnabled = enabled
}

function logCellOptionsUnderMouse() {
  if (!isLogCellOptionsEnabled)
    return false

  if (grid == undefined)
    return true

  const w = width / DIM;
  const h = height / DIM;
  const cellIndex = int(floor(mouseY / h)) * DIM + int(floor(mouseX / w))
  logCellOptions(cellIndex, 'mouse click')
}

function logCellOptions(cellIndex, cause) {
  let x = cellIndex % DIM
  let y = (cellIndex / DIM) | 0
  console.log(`Logging options for cell at ${x}/${y}`)

  let cell = grid[cellIndex]
  let tile = undefined
  if (cell != undefined) {
    const tileIndex = cell.options.first_value()
    if (tileIndex >= 0) {
      tile = tiles[tileIndex]
    }
  }

  if (cell && tile)
    console.log(`Cell ${cellIndex} has tile: ${tile.index}`)

  {
    let options = []
    if (tile)
      options = tile.down.to_array()

    let otherCellIndex = cellIndex + DIM
    if (otherCellIndex >= 0 && otherCellIndex < grid.length) {
      let otherCell = grid[otherCellIndex]
      let otherTileOptions = otherCell.options.to_array();
      console.log(`That tile has down: ${options.join(',')} vs down tile being ${otherTileOptions.join(',')}`)
    }
  }

  {
    let options = []
    if (tile)
      options = tile.up.to_array()

    let otherCellIndex = cellIndex - DIM
    if (otherCellIndex >= 0 && otherCellIndex < grid.length) {
      let otherCell = grid[otherCellIndex]
      let otherTileOptions = otherCell.options.to_array();
      console.log(`That tile has up: ${options.join(',')} vs up tile being ${otherTileOptions.join(',')}`)
    }
  }

  {
    let options = []
    if (tile)
      options = tile.left.to_array()

    let otherCellIndex = cellIndex - 1
    if (otherCellIndex >= 0 && otherCellIndex < grid.length) {
      let otherCell = grid[otherCellIndex]
      let otherTileOptions = otherCell.options.to_array();
      console.log(`That tile has left: ${options.join(',')} vs left tile being ${otherTileOptions.join(',')}`)
    }
  }


  {
    let options = []
    if (tile)
      options = tile.right.to_array()

    let otherCellIndex = cellIndex + 1
    if (otherCellIndex >= 0 && otherCellIndex < grid.length) {
      let otherCell = grid[otherCellIndex]
      let otherTileOptions = otherCell.options.to_array();
      console.log(`That tile has right: ${options.join(',')} vs right tile being ${otherTileOptions.join(',')}`)
    }
  }

  return true
}

