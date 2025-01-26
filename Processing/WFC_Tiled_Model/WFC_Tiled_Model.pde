// Wave Function Collapse-like Example in Processing (Java)
// --------------------------------------------------------

import processing.core.*;
import java.util.*;


// Global arrays/lists
ArrayList<Tile> tiles = new ArrayList<>();
PImage[] tileImages = new PImage[13];

Cell[] grid;        // Store DIM*DIM cells in a 1D array
int DIM = 25;       // Grid dimension


void setup() {
  size(400, 400);
  // Load tile images (equivalent to p5.js preload)
  String path = "tiles/circuit-coding-train";
  for (int i = 0; i < 13; i++) {
    tileImages[i] = loadImage(path + "/" + i + ".png");
  }

  // Initialize tiles with images and edges
  // Using same ordering as p5.js code
  tiles.add(new Tile(tileImages[0], new String[] {"AAA", "AAA", "AAA", "AAA"}));
  tiles.add(new Tile(tileImages[1], new String[] {"BBB", "BBB", "BBB", "BBB"}));
  tiles.add(new Tile(tileImages[2], new String[] {"BBB", "BCB", "BBB", "BBB"}));
  tiles.add(new Tile(tileImages[3], new String[] {"BBB", "BDB", "BBB", "BDB"}));
  tiles.add(new Tile(tileImages[4], new String[] {"ABB", "BCB", "BBA", "AAA"}));
  tiles.add(new Tile(tileImages[5], new String[] {"ABB", "BBB", "BBB", "BBA"}));
  tiles.add(new Tile(tileImages[6], new String[] {"BBB", "BCB", "BBB", "BCB"}));
  tiles.add(new Tile(tileImages[7], new String[] {"BDB", "BCB", "BDB", "BCB"}));
  tiles.add(new Tile(tileImages[8], new String[] {"BDB", "BBB", "BCB", "BBB"}));
  tiles.add(new Tile(tileImages[9], new String[] {"BCB", "BCB", "BBB", "BCB"}));
  tiles.add(new Tile(tileImages[10], new String[] {"BCB", "BCB", "BCB", "BCB"}));
  tiles.add(new Tile(tileImages[11], new String[] {"BCB", "BCB", "BBB", "BBB"}));
  tiles.add(new Tile(tileImages[12], new String[] {"BBB", "BCB", "BBB", "BCB"}));

  // Assign index to each tile (0-12 in the original set)
  for (int i = 0; i < tiles.size(); i++) {
    tiles.get(i).index = i;
  }

  // Generate rotated versions of tiles and remove duplicates
  int initialTileCount = tiles.size();
  ArrayList<Tile> rotatedSet = new ArrayList<>();
  for (int i = 0; i < initialTileCount; i++) {
    Tile original = tiles.get(i);
    ArrayList<Tile> tempTiles = new ArrayList<>();
    for (int r = 0; r < 4; r++) {
      tempTiles.add(original.rotate(r));
    }
    tempTiles = removeDuplicatedTiles(tempTiles);
    rotatedSet.addAll(tempTiles);
  }
  tiles.addAll(rotatedSet);

  // Print total number of tiles (including rotations)
  println(tiles.size());

  // Analyze adjacency for all tiles
  for (int i = 0; i < tiles.size(); i++) {
    tiles.get(i).analyze(tiles);
  }

  // Initialize the grid
  startOver();
}

void draw() {
  background(0);

  float w = (float) width / DIM;
  float h = (float) height / DIM;

  // Draw the grid
  for (int j = 0; j < DIM; j++) {
    for (int i = 0; i < DIM; i++) {
      Cell cell = grid[i + j * DIM];
      if (cell.collapsed) {
        int index = cell.options.get(0);
        image(tiles.get(index).img, i * w, j * h, w, h);
      } else {
        noFill();
        stroke(51);
        rect(i * w, j * h, w, h);
      }
    }
  }

  // Pick cell with least entropy
  ArrayList<Cell> gridCopy = new ArrayList<>();
  for (Cell c : grid) {
    if (!c.collapsed) {
      gridCopy.add(c);
    }
  }

  // If every cell is collapsed, we are done
  if (gridCopy.size() == 0) {
    return;
  }

  // Sort by number of options
  Collections.sort(gridCopy, (a, b) -> a.options.size() - b.options.size());

  int len = gridCopy.get(0).options.size();
  int stopIndex = 0;
  for (int i = 1; i < gridCopy.size(); i++) {
    if (gridCopy.get(i).options.size() > len) {
      stopIndex = i;
      break;
    }
  }

  // Filter down to only those with the same minimal length
  if (stopIndex > 0) {
    gridCopy.subList(stopIndex, gridCopy.size()).clear();
  }

  // Pick a random cell among these
  Cell cell = gridCopy.get((int) random(gridCopy.size()));
  cell.collapsed = true;
  // Pick a random tile option for this cell
  if (cell.options.size() == 0) {
    // No valid options -> reset
    startOver();
    return;
  }
  int pick = cell.options.get((int) random(cell.options.size()));
  cell.options.clear();
  cell.options.add(pick);

  // Now we propagate constraints outward
  Cell[] nextGrid = new Cell[DIM * DIM];
  for (int j = 0; j < DIM; j++) {
    for (int i = 0; i < DIM; i++) {
      int index = i + j * DIM;
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {
        // Start with all possible options
        ArrayList<Integer> options = new ArrayList<>();
        for (int t = 0; t < tiles.size(); t++) {
          options.add(t);
        }

        // Look up
        if (j > 0) {
          Cell up = grid[i + (j - 1) * DIM];
          ArrayList<Integer> validOptions = new ArrayList<>();
          for (int opt : up.options) {
            ArrayList<Integer> valid = tiles.get(opt).down;
            validOptions.addAll(valid);
          }
          checkValid(options, validOptions);
        }
        // Look right
        if (i < DIM - 1) {
          Cell right = grid[i + 1 + j * DIM];
          ArrayList<Integer> validOptions = new ArrayList<>();
          for (int opt : right.options) {
            ArrayList<Integer> valid = tiles.get(opt).left;
            validOptions.addAll(valid);
          }
          checkValid(options, validOptions);
        }
        // Look down
        if (j < DIM - 1) {
          Cell down = grid[i + (j + 1) * DIM];
          ArrayList<Integer> validOptions = new ArrayList<>();
          for (int opt : down.options) {
            ArrayList<Integer> valid = tiles.get(opt).up;
            validOptions.addAll(valid);
          }
          checkValid(options, validOptions);
        }
        // Look left
        if (i > 0) {
          Cell left = grid[i - 1 + j * DIM];
          ArrayList<Integer> validOptions = new ArrayList<>();
          for (int opt : left.options) {
            ArrayList<Integer> valid = tiles.get(opt).right;
            validOptions.addAll(valid);
          }
          checkValid(options, validOptions);
        }

        nextGrid[index] = new Cell(options);
      }
    }
  }
  grid = nextGrid;
}

// --------------------------------------------------------
// Helper functions (migrated from p5.js to Processing)
// --------------------------------------------------------

// Start over - initialize the grid so every cell is uncollapsed
// with all possible tile options
void startOver() {
  grid = new Cell[DIM * DIM];
  for (int i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.size());
  }
}

// Remove invalid options from 'arr' if they're not in 'valid'
void checkValid(ArrayList<Integer> arr, ArrayList<Integer> valid) {
  for (int i = arr.size() - 1; i >= 0; i--) {
    int element = arr.get(i);
    if (!valid.contains(element)) {
      arr.remove(i);
    }
  }
}

// Remove duplicated tiles based on identical edges
ArrayList<Tile> removeDuplicatedTiles(ArrayList<Tile> tileList) {
  LinkedHashMap<String, Tile> uniqueMap = new LinkedHashMap<>();
  for (Tile t : tileList) {
    // Join the edges with commas to form a unique key
    String key = String.join(",", t.edges);
    // This will overwrite duplicates with the last encountered,
    // but we only need one of each key
    uniqueMap.put(key, t);
  }
  return new ArrayList<>(uniqueMap.values());
}

// Reverse a string
String reverseString(String s) {
  return new StringBuilder(s).reverse().toString();
}

// Compare if one edge matches the reverse of another
boolean compareEdge(String a, String b) {
  return a.equals(reverseString(b));
}
