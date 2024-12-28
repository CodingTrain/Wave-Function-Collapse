import java.nio.ByteBuffer;
import java.util.Base64;
import java.util.Comparator;

PImage sourceImage;
ArrayList<Tile> tiles;
int DIMW, DIMH;
float w = 5;
int maxDepth = 50;
ArrayList<Cell> grid;

int seedCount = 8;

final int TRIGHT = 0;
final int TLEFT = 1;
final int TUP = 2;
final int TDOWN = 3;

void setup() {
  size(1920/2, 1080/2);
  pixelDensity(2);
  sourceImage = loadImage("logo_16_bw.png");
  tiles = extractTiles(sourceImage);
  for (Tile tile : tiles) {
    tile.calculateNeighbors(tiles);
  }
  startOver();
}

void startOver() {
  seedCount++;
  randomSeed(seedCount);
  DIMW = floor(width/w);
  DIMH = floor(height/w);
  int count = 0;
  grid = new ArrayList<Cell>();
  for (int j = 0; j < DIMH; j++) {
    for (int i = 0; i < DIMW; i++) {
      grid.add(new Cell(tiles, i * w, j * w, w, count));
      count++;
    }
  }
  wfc(true);
}

  void draw() {
    background(0);
    println(frameRate);
    for (int i = 0; i < grid.size(); i++) {
      grid.get(i).show();
      grid.get(i).checked = false;
    }
    wfc(false);

    saveFrame("render/render####.png");
  }

  void wfc(boolean firstTime) {
    // WAVE FUNCTION COLLAPSE
    // Make a copy of grid
    ArrayList<Cell> gridCopy = new ArrayList<Cell>(grid);
    // Remove any collapsed cells
    gridCopy.removeIf(a -> a.collapsed);

    // The algorithm has completed if everything is collapsed
    if (gridCopy.size() == 0) {
      return;
    }

    // Calculate entropy for each cell
    for (Cell cell : gridCopy) {
      cell.calculateEntropy();
    }

    // Sort by entropy (lowest first)
    gridCopy.sort(new Comparator<Cell>() {
      public int compare(Cell a, Cell b) {
        return Float.compare(a.entropy, b.entropy);
      }
    }
    );

    // Keep only the lowest entropy cells
    float minEntropy = gridCopy.get(0).entropy;
    int stopIndex = gridCopy.size();
    for (int i = 1; i < gridCopy.size(); i++) {
      if (gridCopy.get(i).entropy > minEntropy) {
        stopIndex = i;
        break;
      }
    }
    if (stopIndex > 0) {
      gridCopy = new ArrayList<Cell>(gridCopy.subList(0, stopIndex));
    }

    // Collapse a cell
    int r = (int)random(gridCopy.size());
    if (firstTime) {
      r = gridCopy.size()/2 + DIMW/2;
    }

    Cell cell = gridCopy.get(r);
    cell.collapsed = true;
    int pick = weightedSelection(cell.options);
    if (pick == -1) {
      println("ran into a conflict");
      startOver();
      noLoop();
      return;
    }

    cell.options = new ArrayList<Integer>();
    cell.options.add(pick);
    reduceEntropy(grid, cell, 0);
  }

  int weightedSelection(ArrayList<Integer> options) {
    float total = 0;
    for (int option : options) {
      total += tiles.get(option).frequency;
    }

    float r = random(1) * total;
    float sum = 0;
    for (int option : options) {
      sum += tiles.get(option).frequency;
      if (r < sum) {
        return option;
      }
    }
    return -1;
  }

  void reduceEntropy(ArrayList<Cell> grid, Cell cell, int depth) {
    if (depth > maxDepth) return;
    if (cell.checked) return;
    cell.checked = true;
    int index = cell.index;
    int i = index % DIMW;
    int j = index / DIMW;

    // RIGHT
    if (i + 1 < DIMW) {
      Cell rightCell = grid.get(i + 1 + j * DIMW);
      boolean checked = checkOptions(cell, rightCell, TRIGHT);
      if (checked) {
        reduceEntropy(grid, rightCell, depth + 1);
      }
    }

    // LEFT
    if (i - 1 >= 0) {
      Cell leftCell = grid.get(i - 1 + j * DIMW);
      boolean checked = checkOptions(cell, leftCell, TLEFT);
      if (checked) {
        reduceEntropy(grid, leftCell, depth + 1);
      }
    }

    // DOWN
    if (j + 1 < DIMH) {
      Cell downCell = grid.get(i + (j + 1) * DIMW);
      boolean checked = checkOptions(cell, downCell, TDOWN);
      if (checked) {
        reduceEntropy(grid, downCell, depth + 1);
      }
    }

    // UP
    if (j - 1 >= 0) {
      Cell upCell = grid.get(i + (j - 1) * DIMW);
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
