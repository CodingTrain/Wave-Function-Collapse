// --------------------------------------------
//  Class: Tile
// --------------------------------------------
class Tile {
  PImage img;
  int index;
  int frequency;

  // Each tile has adjacency lists for each direction
  ArrayList<Integer>[] neighbors;

  // Constructor
  Tile(PImage img, int index) {
    this.img = img;
    this.index = index;
    this.frequency = 1;  // Start with frequency=1
    neighbors = new ArrayList[4];
    for (int k = 0; k < 4; k++) {
      neighbors[k] = new ArrayList<Integer>();
    }
  }

  // Determine which tiles can neighbor this tile in each direction
  void calculateNeighbors(ArrayList<Tile> allTiles) {
    for (int i = 0; i < allTiles.size(); i++) {
      Tile other = allTiles.get(i);
      if (overlapping(other, EAST)) {
        neighbors[EAST].add(i);
      }
      if (overlapping(other, WEST)) {
        neighbors[WEST].add(i);
      }
      if (overlapping(other, NORTH)) {
        neighbors[NORTH].add(i);
      }
      if (overlapping(other, SOUTH)) {
        neighbors[SOUTH].add(i);
      }
    }
  }

  // Check if this tile and 'other' match in a given direction
  boolean overlapping(Tile other, int direction) {
    // Make sure pixel data is loaded
    this.img.loadPixels();
    other.img.loadPixels();
    int w = TILE_SIZE;

    if (direction == EAST) {
      // Compare right edge of 'this' to left edge of 'other'
      for (int x = 1; x < w; x++) {
        for (int y = 0; y < w; y++) {
          int indexA = (x + y * w);
          int indexB = (x - 1 + y * w);
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    } else if (direction == WEST) {
      // Compare left edge of 'this' to right edge of 'other'
      for (int x = 0; x < w - 1; x++) {
        for (int y = 0; y < w; y++) {
          int indexA = (x + y * w);
          int indexB = (x + 1 + y * w);
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    } else if (direction == NORTH) {
      // Compare top edge of 'this' to bottom edge of 'other'
      for (int y = 0; y < w - 1; y++) {
        for (int x = 0; x < w; x++) {
          int indexA = (x + y * w);
          int indexB = (x + (y + 1) * w);
          if (differentColor(this.img, indexA, other.img, indexB)) {
            return false;
          }
        }
      }
      return true;
    } else if (direction == SOUTH) {
      // Compare bottom edge of 'this' to top edge of 'other'
      for (int y = 1; y < w; y++) {
        for (int x = 0; x < w; x++) {
          int indexA = (x + y * w);
          int indexB = (x + (y - 1) * w);
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


// Utility: check if two pixels differ
boolean differentColor(PImage imgA, int indexA, PImage imgB, int indexB) {
  int cA = imgA.pixels[indexA];
  int cB = imgB.pixels[indexB];
  return cA != cB;
}
