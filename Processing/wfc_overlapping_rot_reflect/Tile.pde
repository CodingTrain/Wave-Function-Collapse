
class Tile {
  PImage img;
  int index;
  int frequency;
  ArrayList<Integer>[] neighbors;

  Tile(PImage img, int i) {
    this.img = img;
    this.img.loadPixels();
    this.index = i;
    this.frequency = 1;
    neighbors = new ArrayList[4];
    for (int j = 0; j < 4; j++) {
      neighbors[j] = new ArrayList<Integer>();
    }
  }

  void calculateNeighbors(ArrayList<Tile> tiles) {
    for (int i = 0; i < tiles.size(); i++) {
      if (this.overlapping(tiles.get(i), TRIGHT)) {
        neighbors[TRIGHT].add(i);
      }
      if (this.overlapping(tiles.get(i), TLEFT)) {
        neighbors[TLEFT].add(i);
      }
      if (this.overlapping(tiles.get(i), TUP)) {
        neighbors[TUP].add(i);
      }
      if (this.overlapping(tiles.get(i), TDOWN)) {
        neighbors[TDOWN].add(i);
      }
    }
  }

  boolean overlapping(Tile other, int direction) {
    if (direction == TRIGHT) {
      for (int i = 1; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
          int indexA = i + j * 3;
          int indexB = (i - 1) + j * 3;
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    } else if (direction == TLEFT) {
      for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++) {
          int indexA = i + j * 3;
          int indexB = (i + 1) + j * 3;
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    } else if (direction == TUP) {
      for (int j = 0; j < 2; j++) {
        for (int i = 0; i < 3; i++) {
          int indexA = i + j * 3;
          int indexB = i + (j + 1) * 3;
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    } else if (direction == TDOWN) {
      for (int j = 1; j < 3; j++) {
        for (int i = 0; i < 3; i++) {
          int indexA = i + j * 3;
          int indexB = i + (j - 1) * 3;
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }
}
