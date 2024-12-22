
class Cell {
  float x, y, w;
  int index;
  HashSet<Integer> options;
  boolean collapsed;
  boolean checked;
  float entropy;

  Cell(ArrayList<Tile> tiles, float x, float y, float w, int index) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.index = index;
    this.collapsed = false;
    this.checked = false;
    this.options = new HashSet<Integer>();
    for (int i = 0; i < tiles.size(); i++) {
      this.options.add(i);
    }
    this.entropy = 0;
  }

  void show() {
    if (this.collapsed) {
      int tileIndex = this.options.iterator().next();
      PImage img = tiles.get(tileIndex).img;
      renderCell(img, this.x, this.y, this.w);
    } else {
      // Visualize the cell's uncertainty
      float sumR = 0;
      float sumG = 0;
      float sumB = 0;
      for (int option : this.options) {
        PImage img = tiles.get(option).img;
        int index = 1 + 1 * img.width; // Center pixel of a 3x3 tile
        int col = img.pixels[index];
        sumR += red(col);
        sumG += green(col);
        sumB += blue(col);
      }
      sumR /= this.options.size();
      sumG /= this.options.size();
      sumB /= this.options.size();
      fill(sumR, sumG, sumB);
      noStroke();
      rect(this.x, this.y, this.w, this.w);
    }
  }
}
