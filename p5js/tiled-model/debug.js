 
// DEBUG: show edges
function drawEdges() {
  if (edges != undefined) {
    let size = 36
    for (let i = 0; i < edges.length; i++) {
      let w = min(24, max(10, edges[i].img.width))
      let h = min(24, max(10, edges[i].img.height))
      image(edges[i].img, i * size, 0, w, h)
    }
  }
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

  drawnTileIndex = (drawnTileIndex + tiles.length) % tiles.length

  const w = width / DIM
  const h = height / DIM

  const spacing = 6

  let x = width/2 - w*2
  let y = height/2 - h*2

  let tile = tiles[drawnTileIndex]
  image(tile.img, x, y, w*4, h*4)

  x = width/2 + w*2 + spacing
  y = height/2 - h*2
  for (let otherIndex of tile.right) {
    let other = tiles[otherIndex]
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
    image(other.img, x, y, w, h)

    y += h + spacing
    if (y > height - h) {
      x += w + spacing
      y = height/2 + h*2 + spacing
    }
  }

  return true
}

function mouseClickedForLogNeighborsOptions() {
  const w = width / DIM;
  const h = height / DIM;
  let cellIndex = int(floor(mouseY / h)) * DIM + int(floor(mouseX / w))
  let cell = grid[cellIndex]
  let tileIndex = cell.options.keys().next().value;
  let tile = tiles[tileIndex]

  console.log(`Cell ${cellIndex} has tile: ${tileIndex}`)

  {
    let options = Array.from(tile.down.keys())
    let otherCellIndex = cellIndex + DIM
    if (otherCellIndex >= 0 && otherCellIndex < grid.length) {
      let otherCell = grid[otherCellIndex]
      let otherTileIndex = otherCell.options.keys().next().value;
      console.log(`That tile has down: ${options.join(',')} vs down tile being ${otherTileIndex}`)
    }
  }

  {
    let options = Array.from(tile.up.keys())
    let otherCellIndex = cellIndex - DIM
    if (otherCellIndex >= 0 && otherCellIndex < grid.length) {
      let otherCell = grid[otherCellIndex]
      let otherTileIndex = otherCell.options.keys().next().value;
      console.log(`That tile has up: ${options.join(',')} vs up tile being ${otherTileIndex}`)
    }
  }

  {
    let options = Array.from(tile.left.keys())
    let otherCellIndex = cellIndex - 1
    if (otherCellIndex >= 0 && otherCellIndex < grid.length) {
      let otherCell = grid[otherCellIndex]
      let otherTileIndex = otherCell.options.keys().next().value;
      console.log(`That tile has left: ${options.join(',')} vs left tile being ${otherTileIndex}`)
    }
  }


  {
    let options = Array.from(tile.right.keys())
    let otherCellIndex = cellIndex + 1
    if (otherCellIndex >= 0 && otherCellIndex < grid.length) {
      let otherCell = grid[otherCellIndex]
      let otherTileIndex = otherCell.options.keys().next().value;
      console.log(`That tile has right: ${options.join(',')} vs right tile being ${otherTileIndex}`)
    }
  }
}

