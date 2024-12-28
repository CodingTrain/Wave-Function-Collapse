
class Cell {
  float x, y, w;
  int index;
  ArrayList<Integer> options;
  boolean collapsed;
  boolean checked;

  Cell(ArrayList<Tile> tiles, float x, float y, float w, int index) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.index = index;
    this.options = new ArrayList<Integer>();
    this.collapsed = false;
    this.checked = false;
    for (int i = 0; i < tiles.size(); i++) {
      this.options.add(i);
    }
  }

  boolean show() {
    if (this.options.size() == 0) {
      fill(255, 0, 255);
      square(this.x, this.y, this.w);
      return true;
    } else if (this.collapsed) {
      int tileIndex = this.options.get(0);
      PImage img = tiles.get(tileIndex).img;
      renderCell(img, this.x, this.y, this.w);
    } else {
      float sumR = 0;
      float sumG = 0;
      float sumB = 0;
      for (int i = 0; i < this.options.size(); i++) {
        int tileIndex = this.options.get(i);
        PImage img = tiles.get(tileIndex).img;
        int index = 1 + 1 * img.width; // center pixel if 3x3 tile
        int col = img.pixels[index];
        sumR += red(col);
        sumG += green(col);
        sumB += blue(col);
      }
      sumR /= this.options.size();
      sumG /= this.options.size();
      sumB /= this.options.size();
      fill(sumR, sumG, sumB);
      stroke(0);
      strokeWeight(0.5);
      square(this.x, this.y, this.w);
    }
    return false;
  }
}
