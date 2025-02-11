function updateCell(cellindex, indexesNeedingUpdate, forceAdd) {
  let cell = grid[cellindex]
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
    if (cellindex >= DIM) {
      let upIndex = cellindex - DIM;
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
    if (cellindex < grid.length - DIM) {
      let downIndex = cellindex + DIM;
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
    if (cellindex % DIM != 0) {
      let leftIndex = cellindex - 1;
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
    let rightIndex = cellindex + 1;
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

function updateGrid(pickedCellIndex) {
  gridHistory.push(grid)
  grid = grid.slice();

  // let updateCount = 0
  let indexesNeedingUpdate = []
  updateCell(pickedCellIndex, indexesNeedingUpdate, true)
  while (indexesNeedingUpdate.length > 0) {
    // updateCount++
    const index = indexesNeedingUpdate.pop()
    grid[index] = updateCell(index, indexesNeedingUpdate, false)
  }
  // console.log(`Updated ${updateCount} cells`)
}
