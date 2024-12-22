// Wave Function Collapse in Processing Java with Optimizations
import java.util.LinkedList;
import java.util.Comparator;
import java.util.Collections;
import java.util.HashSet;

PImage sourceImage;
ArrayList<Tile> tiles;
int DIM = 40; // Adjusted for testing; you can increase this value
ArrayList<Cell> grid;

final int TRIGHT = 0;
final int TLEFT = 1;
final int TUP = 2;
final int TDOWN = 3;

void setup() {
  size(400, 400);
  sourceImage = loadImage("flowers.png");
  tiles = extractTiles(sourceImage);
  for (Tile tile : tiles) {
    tile.calculateNeighbors(tiles);
  }
  float w = width / (float) DIM;
  grid = new ArrayList<Cell>();
  int count = 0;
  for (int j = 0; j < DIM; j++) {
    for (int i = 0; i < DIM; i++) {
      grid.add(new Cell(tiles, i * w, j * w, w, count));
      count++;
    }
  }
  wfc();
}

void draw() {
  background(0);
  for (Cell cell : grid) {
    cell.show();
    cell.checked = false;
  }
  wfc();
}


boolean differentColor(int colA, int colB) {
  return colA != colB;
}
