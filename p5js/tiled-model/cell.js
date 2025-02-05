let areTileFrequenciesUsed = true

function enableTileFrequencies(enabled) {
  areTileFrequenciesUsed = enabled
}


class Cell {
  constructor(value) {
    // Initialize the cell as not collapsed
    this.collapsed = false;
    // Is an bitmap passed in?
    if (value instanceof Bitmap) {
      // Use the provided bitmap
      this.options = value;
    } else {
      // Fill a new bitmap with all the options
      this.options = new Bitmap();
      this.options.fill(value)
    }
  }

  collapse() {
    if (this.options.size() == 0)
      return false
  
    // Collapse the cell to one of its tile options,
    // taking the tile frequencies into account

    let totalFreq = 0
    for (let tileIndex of this.options) {
      if (areTileFrequenciesUsed) {
        totalFreq += tiles[tileIndex].frequency
      }
      else {
        totalFreq += 1
      }
    }

    let pickInFreq = floor(random(totalFreq))
    let pickedTileIndex = 0
    for (pickedTileIndex of this.options) {
      if (pickInFreq <= 0)
        break
      if (areTileFrequenciesUsed) {
        pickInFreq -= tiles[pickedTileIndex].frequency
      }
      else {
        pickInFreq -= 1
      }
    }
  
    this.collapsed = true;
    this.options.truncate(0)
    this.options.add(pickedTileIndex)

    return true
  }
}
