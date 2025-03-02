let areTileFrequenciesUsed = true

function enableTileFrequencies(enabled) {
  areTileFrequenciesUsed = enabled
}

let isShowContradictionsEnabled = false

function enableShowContradictions(enabled) {
    isShowContradictionsEnabled = enabled
}

class Cell {
  constructor(value) {
    // Initialize the cell as not collapsed and empty options
    this.collapsed = false
    this.updated = true
    this.options = new Bitmap();

    if (value instanceof Bitmap) {
      // If a bitmap is provided, copy it
      this.options.in_place_union(value)
    } else {
      // If a non-bitmap is provided, assume it is the number of all possible options
      // and fillthe cell with all those options.
      this.options.fill(value)
    }
  }

  draw (i, j, w, h) {
    const x = i * w
    const y = j * h
    if (this.collapsed) {
      const tileIndex = this.options.first_value()
      const tile = tiles[tileIndex]
      const offset = tile.edge_depth - 1
      image(tile.img, x, y, w, h,
        offset, offset, tile.img.width - offset * 2, tile.img.height - offset * 2)
    }
    else {
      if (isShowContradictionsEnabled && contradictions[i + j * DIM] > 0) {
        fill(51 + contradictions[i + j * DIM], 51, 51)
        contradictions[i + j * DIM]--
        rect(x + 1, y + 1, w-2, h-2)
      }
      else {
        let r = 0
        let g = 0
        let b = 0
        let count = 0
        for (let tileIndex of this.options) {
          const tile = tiles[tileIndex]
          if (tile != undefined) {
            const center = (Math.floor((tile.img.height) / 2) * tile.img.width + Math.floor((tile.img.width) / 2)) * 4
            r += tile.img.pixels[center + 0] * tile.frequency
            g += tile.img.pixels[center + 1] * tile.frequency
            b += tile.img.pixels[center + 2] * tile.frequency
            count += tile.frequency
          }
        }
        if (count > 0)
          fill(r/count | 0, g/count | 0, b/count | 0, 80)
        else
          fill(51)
        rect(x + 1, y + 1, w-2, h-2)
      }
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
  
    this.collapsed = true
    this.updated = true
    this.options.truncate(0)
    this.options.add(pickedTileIndex)

    return true
  }
}
