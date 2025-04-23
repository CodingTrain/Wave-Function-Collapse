// Saving the log of 2 for shannon entropy calculation
const log2 = Math.log(2);

// A Cell is a single element of the grid
class Cell {
  constructor(tiles, x, y, w, index) {
    // xy and size of cell
    this.x = x;
    this.y = y;
    this.w = w;
    // Index in the grid array
    this.index = index;

    // The indices of tiles that can be placed in this cell
    this.options = [];

    // Has it been collapsed to a single tile?
    this.collapsed = false;
    // Has it already been checked during recursion?
    this.checked = false;

    // Initialize the options with all possible tile indices
    for (let i = 0; i < tiles.length; i++) {
      this.options.push(i);
    }

    // This keeps track of what the previous options were
    // Saves recalculating entropy if nothing has changed
    this.previousTotalOptions = -1;

    // Variable to track if cell needs to be redrawn
    this.needsRedraw = true;
  }

  calculateEntropy() {
    // Don't need to recalculate entropy if nothing changed
    // Possible issue if same # of options but different options?
    if (this.previousTotalOptions == this.options.length) {
      return;
    }
    // Now save the new current total
    this.previousTotalOptions = this.options.length;

    // Compute total frequency of all of the options
    let totalFrequency = 0;
    for (let option of this.options) {
      totalFrequency += tiles[option].frequency;
    }

    // Calculate "Shannon" Entropy
    this.entropy = 0;
    for (let option of this.options) {
      // Calculate probability for each tile
      let frequency = tiles[option].frequency;
      let probability = frequency / totalFrequency;
      // Shannon entropy is the negative sum: P * log2(P)
      this.entropy -= probability * (log(probability) / log2);
    }
  }

  // Render the cell based on its state
  show() {
    // Only if the cell needs to be redrawn
    if (this.needsRedraw) {
      if (this.options.length == 0) {
        // Ignore conflicts
      } else if (this.collapsed) {
        let tileIndex = this.options[0];
        let img = tiles[tileIndex].img;
        renderCell(img, this.x, this.y, this.w);
      } else {
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        for (let i = 0; i < this.options.length; i++) {
          let tileIndex = this.options[i];
          let img = tiles[tileIndex].img;
          let centerIndex = floor(TILE_SIZE / 2);
          let index = (centerIndex + centerIndex * TILE_SIZE) * 4;
          sumR += img.pixels[index + 0];
          sumG += img.pixels[index + 1];
          sumB += img.pixels[index + 2];
        }
        sumR /= this.options.length;
        sumG /= this.options.length;
        sumB /= this.options.length;
        fill(sumR, sumG, sumB);
        square(this.x, this.y, this.w);

        fill(0);
        noStroke();
        textSize(this.w / 2);
        textAlign(CENTER, CENTER);
        text(this.options.length, this.x + this.w / 2, this.y + this.w / 2);
      }
      // No need to redraw until something has changed
      this.needsRedraw = false;
    }
  }
}
