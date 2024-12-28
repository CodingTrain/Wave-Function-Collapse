import java.util.Comparator;

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
  sourceImage = loadImage("logo_16_bw.png");
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
