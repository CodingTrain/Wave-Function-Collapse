
class HybridWFC extends MultiStepsAlgo {
  constructor() {
    super()
  }

  *run() {
    while (true) {
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
        return this.finished()
      }

      // If the lowest entropy is zero, it means there is a cell
      // without any option left, we reached a contraction, so
      // rewind history and try again.
      if (lowestEntropy <= 0) {
        rewindHistory()
        yield 'Found zero-entropy contradiction' 
      }

      // Pick a random cell with lowest entropy.
      let chosenCellIndex = random(lowestIndexes)

      if (!grid[chosenCellIndex].collapse()) {
        contradictions[chosenCellIndex] = 200
        rewindHistory()
        yield 'Cannot collapse cell'
      }

      _updateGrid(chosenCellIndex)
      decreaseRewind()

      const cellX = chosenCellIndex % DIM
      const cellY = chosenCellIndex / DIM | 0
      yield `Collapsed cell at ${cellX} / ${cellY}`
    }
  }
}

function _updateCell(cellIndex, indexesNeedingUpdate, forceAdd) {
  let cell = grid[cellIndex]
  let newCell
  if (cell.collapsed) {
    newCell = cell
  }
  else {
    newCell = new Cell(cell.options)
  }

  const updatedIndexes = []
  let cellChanged = forceAdd

  {
    if (cellIndex >= DIM) {
      let upIndex = cellIndex - DIM;
      const upCell = grid[upIndex]
      updatedIndexes.push(upIndex)
      if (!newCell.collapsed) {
        updateOtherOptions.clear()
        for (let option of upCell.options) {
          updateOtherOptions.in_place_union(tiles[option].down)
        }
        cellChanged |= newCell.options.in_place_intersection(updateOtherOptions)
      }
    }
  }

  {
    if (cellIndex < grid.length - DIM) {
      let downIndex = cellIndex + DIM;
      const downCell = grid[downIndex]
      updatedIndexes.push(downIndex)
      if (!newCell.collapsed) {
        updateOtherOptions.clear()
        for (let option of downCell.options) {
          updateOtherOptions.in_place_union(tiles[option].up)
        }
        cellChanged |= newCell.options.in_place_intersection(updateOtherOptions)
      }
    }
  }

  {
    if (cellIndex % DIM != 0) {
      let leftIndex = cellIndex - 1;
      const leftCell = grid[leftIndex]
      updatedIndexes.push(leftIndex)
      if (!newCell.collapsed) {
        updateOtherOptions.clear()
        for (let option of leftCell.options) {
          updateOtherOptions.in_place_union(tiles[option].right)
        }
        cellChanged |= newCell.options.in_place_intersection(updateOtherOptions)
      }
    }
  }

  {
    let rightIndex = cellIndex + 1;
    if (rightIndex % DIM != 0) {
      const rightCell = grid[rightIndex]
      updatedIndexes.push(rightIndex)
      if (!newCell.collapsed) {
        updateOtherOptions.clear()
        for (let option of rightCell.options) {
          updateOtherOptions.in_place_union(tiles[option].left)
        }
        cellChanged |= newCell.options.in_place_intersection(updateOtherOptions)
      }
    }
  }

  if (cellChanged) {
    if (!cell.collapsed)
      cell.updated = true
    for (let index of updatedIndexes) {
      indexesNeedingUpdate.push(index)
    }
  }

  return newCell
}

function _updateGrid(pickedCellIndex) {
  gridHistory.push(grid)
  grid = grid.slice();

  // let updateCount = 0
  let indexesNeedingUpdate = []
  _updateCell(pickedCellIndex, indexesNeedingUpdate, true)
  while (indexesNeedingUpdate.length > 0) {
    // updateCount++
    const index = indexesNeedingUpdate.pop()
    grid[index] = _updateCell(index, indexesNeedingUpdate, false)
  }
  // console.log(`Updated ${updateCount} cells`)
}
