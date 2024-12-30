final float log2 = log(2);


class Cell {
  float x, y, w;
  int index;
  ArrayList<Integer> options;
  boolean collapsed;
  boolean checked;
  float entropy;
  boolean dead;

  int totalOptions;


  Cell(ArrayList<Tile> tiles, float x, float y, float w, int index) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.index = index;
    this.options = new ArrayList<Integer>();
    this.collapsed = false;
    this.checked = false;
    this.entropy = 0;
    for (int i = 0; i < tiles.size(); i++) {
      this.options.add(i);
    }
    this.totalOptions = -1;
    this.dead = false;
  }
  void calculateEntropy() {

    // No options left
    if (this.options.size() == 0) {
      return;
    }

    int currentTotal = this.options.size();
    // Don't need to recalculate entropy
    // Possible issue if same # of options but different options?
    if (this.totalOptions == currentTotal) {
      return;
    }
    this.totalOptions = currentTotal;
    this.entropy = 0;

    // Compute total frequency
    float totalFrequency = 0;
    for (int option : this.options) {
      totalFrequency += tiles.get(option).frequency;
    }

    if (totalFrequency == 0) {
      return;
    }

    // Calculate entropy
    for (int option : this.options) {
      float frequency = tiles.get(option).frequency;
      float probability = frequency / totalFrequency;
      this.entropy -= probability * (log(probability) / log2);
    }
  }


  boolean show() {
    if (this.options.size() == 0 || this.dead) {
      // fill(112, 50, 126);
      // square(this.x, this.y, this.w);
      // return true;
    } else if (this.collapsed) {
      int tileIndex = this.options.get(0);
      PImage img = tiles.get(tileIndex).img;
      renderCell(img, this.x, this.y, this.w);
    } else {
      float sumR = 0;
      float sumG = 0;
      float sumB = 0;
      float sumFreq = 0;
      for (int i = 0; i < this.options.size(); i++) {
        int tileIndex = this.options.get(i);
        Tile t = tiles.get(tileIndex);
        PImage img = t.img;
        int index = 1 + 1 * img.width; // center pixel if 3x3 tile
        int col = img.pixels[index];
        sumR += red(col)*t.frequency;
        sumG += green(col)*t.frequency;
        sumB += blue(col)*t.frequency;
        sumFreq += t.frequency;
      }
      sumR /= sumFreq;
      sumG /= sumFreq;
      sumB /= sumFreq;
      fill(sumR, sumG, sumB);
      stroke(0);
      strokeWeight(0.5);
      square(this.x, this.y, this.w);
    }
    return false;
  }
}


//float log2 (float x) {
//  return (log(x) / log(2));
//}
