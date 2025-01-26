
// --------------------------------------------
//  Class: Cell
// --------------------------------------------
class Cell {
  float x, y, w;
  int index;

  ArrayList<Integer> options;  // Which tile indices are still valid
  boolean collapsed;
  boolean checked;

  // Keep track of previous # of options for entropy
  int previousTotalOptions = -1;
  // Shannon Entropy
  float entropy;
  boolean needsRedraw;

  Cell(ArrayList<Tile> tiles, float x, float y, float w, int index) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.index = index;
    this.collapsed = false;
    this.checked = false;
    this.needsRedraw = true;
    options = new ArrayList<Integer>();

    // Start with *all* tile indices
    for (int i = 0; i < tiles.size(); i++) {
      options.add(i);
    }
  }

  // Compute Shannon entropy for the cell
  void calculateEntropy() {
    // If the # of options hasn't changed, skip
    if (this.previousTotalOptions == this.options.size()) {
      return;
    }
    this.previousTotalOptions = this.options.size();

    // Compute total frequency
    float totalFreq = 0;
    for (int optIndex : options) {
      totalFreq += tiles.get(optIndex).frequency;
    }

    // Shannon Entropy = - sum( p * log2(p) )
    float e = 0;
    for (int optIndex : options) {
      float freq = tiles.get(optIndex).frequency;
      float p = freq / totalFreq;
      if (p > 0) {
        e -= p * (log(p) / log(2));
      }
    }
    this.entropy = e;
  }

  // Render the cell
  void show() {
    if (!this.needsRedraw) return;

    if (options.size() == 0) {
      // In conflict: draw nothing or maybe highlight
    } else if (collapsed) {
      // If the cell is collapsed, draw the tile's center color
      int tileIndex = options.get(0);
      PImage img = tiles.get(tileIndex).img;
      renderCell(img, x, y, w);
    } else {
      // Average center color of all possible tiles
      float sumR = 0;
      float sumG = 0;
      float sumB = 0;
      for (int idx : options) {
        PImage img = tiles.get(idx).img;
        int center = (TILE_SIZE / 2) + (TILE_SIZE / 2) * TILE_SIZE;
        int col = img.pixels[center];
        sumR += red(col);
        sumG += green(col);
        sumB += blue(col);
      }
      sumR /= options.size();
      sumG /= options.size();
      sumB /= options.size();
      noStroke();
      fill(sumR, sumG, sumB);
      rect(x, y, w, w);
    }
    this.needsRedraw = false;
  }
}
