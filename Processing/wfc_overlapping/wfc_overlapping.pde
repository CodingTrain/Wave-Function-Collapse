import java.util.Comparator;
// Wave Function Collapse in Processing Java

PImage sourceImage;
ArrayList<Tile> tiles;
int DIM = 80;
int maxDepth = 5;
ArrayList<Cell> grid;

final int TRIGHT = 0;
final int TLEFT = 1;
final int TUP = 2;
final int TDOWN = 3;

void setup() {
  size(800, 800);
  pixelDensity(2);
  sourceImage = loadImage("logo.png");
  tiles = extractTiles(sourceImage);
  for (Tile tile : tiles) {
    tile.calculateNeighbors(tiles);
  }
  float w = width / (float)DIM;
  int count = 0;
  grid = new ArrayList<Cell>();
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
  println(frameRate);
  for (int i = 0; i < grid.size(); i++) {
    grid.get(i).show();
    grid.get(i).checked = false;
  }
  wfc();
  
  //saveFrame("render/render####.png");
}

void wfc() {
  // WAVE FUNCTION COLLAPSE
  // Make a copy of grid
  ArrayList<Cell> gridCopy = new ArrayList<Cell>(grid);
  // Remove any collapsed cells
  gridCopy.removeIf(a -> a.collapsed);

  // The algorithm has completed if everything is collapsed
  if (gridCopy.size() == 0) {
    return;
  }

  // Pick a cell with least entropy
  gridCopy.sort(new Comparator<Cell>() {
    public int compare(Cell a, Cell b) {
      return a.options.size() - b.options.size();
    }
  });

  // Keep only the lowest entropy cells
  int len = gridCopy.get(0).options.size();
  int stopIndex = gridCopy.size();
  for (int i = 1; i < gridCopy.size(); i++) {
    if (gridCopy.get(i).options.size() > len) {
      stopIndex = i;
      break;
    }
  }
  if (stopIndex > 0) {
    gridCopy = new ArrayList<Cell>(gridCopy.subList(0, stopIndex));
  }

  // Collapse a cell
  Cell cell = gridCopy.get((int)random(gridCopy.size()));
  cell.collapsed = true;

  int pick = cell.options.get((int)random(cell.options.size()));
  cell.options = new ArrayList<Integer>();
  cell.options.add(pick);
  reduceEntropy(grid, cell, 0);
}

void reduceEntropy(ArrayList<Cell> grid, Cell cell, int depth) {
  if (depth > maxDepth) return;
  if (cell.checked) return;
  cell.checked = true;
  int index = cell.index;
  int i = index % DIM;
  int j = index / DIM;

  // RIGHT
  if (i + 1 < DIM) {
    Cell rightCell = grid.get(i + 1 + j * DIM);
    boolean checked = checkOptions(cell, rightCell, TRIGHT);
    if (checked) {
      reduceEntropy(grid, rightCell, depth + 1);
    } 
  }

  // LEFT
  if (i - 1 >= 0) {
    Cell leftCell = grid.get(i - 1 + j * DIM);
    boolean checked = checkOptions(cell, leftCell, TLEFT);
    if (checked) {
      reduceEntropy(grid, leftCell, depth + 1);
    }
  }

  // DOWN
  if (j + 1 < DIM) {
    Cell downCell = grid.get(i + (j + 1) * DIM);
    boolean checked = checkOptions(cell, downCell, TDOWN);
    if (checked) {
      reduceEntropy(grid, downCell, depth + 1);
    }
  }

  // UP
  if (j - 1 >= 0) {
    Cell upCell = grid.get(i + (j - 1) * DIM);
    boolean checked = checkOptions(cell, upCell, TUP);
    if (checked) {
      reduceEntropy(grid, upCell, depth + 1);
    }
  }
}

boolean checkOptions(Cell cell, Cell neighbor, int direction) {
  if (neighbor != null && !neighbor.collapsed) {
    ArrayList<Integer> validOptions = new ArrayList<Integer>();    
    for (int option : cell.options) {
      validOptions.addAll(tiles.get(option).neighbors[direction]);
    }
    // Remove options from neighbor.options that are not in validOptions
    neighbor.options.retainAll(validOptions);
    return true;
  } else {
    return false;
  }
}

class Tile {
  PImage img;
  int index;
  ArrayList<Integer>[] neighbors;

  Tile(PImage img, int i) {
    this.img = img;
    this.img.loadPixels();
    this.index = i;
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

boolean differentColor(PImage imgA, int indexA, PImage imgB, int indexB) {
  int colorA = imgA.pixels[indexA];
  int colorB = imgB.pixels[indexB];
  return colorA != colorB;
}

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

void renderCell(PImage img, float x, float y, float w) {
  int i = img.width / 2;
  int j = img.height / 2;
  int index = i + j * img.width;
  int col = img.pixels[index];
  fill(col);
  stroke(0);
  square(x, y, w);
}

void copyTile(PImage source, int sx, int sy, int w, PImage dest) {
  dest.loadPixels();
  source.loadPixels();
  for (int i = 0; i < w; i++) {
    for (int j = 0; j < w; j++) {
      int pi = (sx + i) % source.width;
      int pj = (sy + j) % source.height;
      int index = pi + pj * source.width;
      int col = source.pixels[index];
      int index2 = i + j * w;
      dest.pixels[index2] = col;
    }
  }
  dest.updatePixels();
}

ArrayList<Tile> extractTiles(PImage img) {
  ArrayList<Tile> tiles = new ArrayList<Tile>();
  img.loadPixels();
  for (int j = 0; j < img.height; j++) {
    for (int i = 0; i < img.width; i++) {
      PImage tileImage = createImage(3, 3, RGB);
      copyTile(img, i, j, 3, tileImage);
      tiles.add(new Tile(tileImage, tiles.size()));
    }
  }
  return tiles;
}
