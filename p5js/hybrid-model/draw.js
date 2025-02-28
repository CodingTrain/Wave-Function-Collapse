let isSmoothDrawingEnabled = false
function enableDrawSmooth(enabled) {
  isSmoothDrawingEnabled = enabled
}

let isFullRedrawTriggered = false
function triggerFullRedraw() {
  isFullRedrawTriggered = true
}

function drawGrid() {
  if (isSmoothDrawingEnabled)
    smooth()
  else
    noSmooth()

  noStroke()
  fill(51)

  const w = width / DIM
  const h = height / DIM
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid[i + j * DIM]
      if (cell == undefined)
        continue
      if (!cell.updated && !isFullRedrawTriggered)
        continue
      cell.updated = false
      cell.draw(i, j, w, h)
    }
  }

  isFullRedrawTriggered = false
  
  smooth()
}
