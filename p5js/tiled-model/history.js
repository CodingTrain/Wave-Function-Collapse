let gridHistory = []
let minRewind = 3
let rewindDepth = minRewind
let maxHistory = 0

function rewindHistory() {
  // Update the maximum hostory we reached before encountering
  // a contradiction. We won't allow decreasing the rewind depth
  // until we successfully go beyond that hostory.
  maxHistory = max(maxHistory, gridHistory.length)

  increaseRewind()

  if (rewindDepth < gridHistory.length) {
    gridHistory = gridHistory.slice(0, gridHistory.length - rewindDepth)
  }
  else {
    // Rewind is greater than history -- rewind to the start
    // and reset rewind depth and max history. Otherwise, we
    // would always rewind to the start from now on.
    gridHistory = gridHistory.slice(0, 1)
    rewindDepth = minRewind
    maxHistory = 0
  }

  grid = gridHistory[gridHistory.length - 1]

  paintReady = true
}

function decreaseRewind() {
  // Don't allow decreasing the rewind until we passed the
  // maximum number of collapsed cells we reached in the past.
  //
  // This avoid for example being caught in a loop of four
  // cell that are all forced but end-up being a contradiction.
  if (gridHistory.length < maxHistory + 2)
    return

  // Always rewind at least a few steps.
  if (rewindDepth > minRewind) {
    rewindDepth--
  }
}

function increaseRewind() {
  // Don't allow rewind depth too large.
  if (rewindDepth < 100) {
    rewindDepth++
  }
}

