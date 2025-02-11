
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
    clearContradictions()
    drawGrid()
    noLoop()
    return false
  }

  // If the lowest entropy is zero, it means there is a cell
  // wihtout any option left, we reached a contraction, so
  // rewind history and try again.
  if (lowestEntropy <= 0) {
    for (let cellIndex of lowestIndexes) {
      contradictions[cellIndex] = 200
      logCellOptions(cellIndex, 'lowest entropy is zero')
    }
    rewindHistory()
    return false
  }

  // Pick a random cell with lowest entropy.
  let chosenCellIndex = random(lowestIndexes)

  if (!grid[chosenCellIndex].collapse()) {
    contradictions[chosenCellIndex] = 200
    logCellOptions(chosenCellIndex, 'cannot collapse cell')
    rewindHistory()
    return false
  }

  updateGrid(chosenCellIndex)

  return true
}
