/**
 * Overlapping WFC in Processing
 * Ported from p5.js version.
 */

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

PImage sourceImage;    // Source image
ArrayList<Tile> tiles; // All extracted tiles
Cell[] grid;           // Grid of cells for the WFC

int GRID_SIZE = 50;
int MAX_RECURSION_DEPTH = 64;
int TILE_SIZE = 3;
float w;

boolean ROTATIONS = true;
boolean REFLECTIONS = false;

// Directions
final int EAST = 0;
final int WEST = 1;
final int NORTH = 2;
final int SOUTH = 3;

void setup() {
  size(500, 500);
  // Load the source image
  sourceImage = loadImage("images/Flowers.png");
  // Cell width based on canvas size and grid size
  w = (float) width / GRID_SIZE;

  // Extract tiles and calculate neighbors
  tiles = extractTiles(sourceImage);
  for (Tile t : tiles) {
    t.calculateNeighbors(tiles);
  }

  // Create the grid and initialize
  initializeGrid();

  // Perform an initial wave function collapse
  wfc();

  // Collapse any cells that have a single option
  for (Cell c : grid) {
    if (c.options.size() == 1) {
      c.collapsed = true;
      reduceEntropy(grid, c, 0);
    }
  }
}

void draw() {
  // Run Wave Function Collapse repeatedly
  wfc();

  // Show the grid
  for (int i = 0; i < grid.length; i++) {
    grid[i].show();
    // Reset "checked" status after each iteration
    grid[i].checked = false;
  }
}

// Create / re-initialize the grid
void initializeGrid() {
  background(0);

  grid = new Cell[GRID_SIZE * GRID_SIZE];
  int count = 0;
  for (int j = 0; j < GRID_SIZE; j++) {
    for (int i = 0; i < GRID_SIZE; i++) {
      grid[count] = new Cell(tiles, i * w, j * w, w, count);
      count++;
    }
  }
}

// Main WFC function
void wfc() {
  // Calculate entropy for each cell
  for (Cell c : grid) {
    c.calculateEntropy();
  }

  // Find cells with the lowest entropy (fewest options)
  float minEntropy = Float.POSITIVE_INFINITY;
  ArrayList<Cell> lowestEntropyCells = new ArrayList<Cell>();

  for (Cell c : grid) {
    if (!c.collapsed) {
      if (c.entropy < minEntropy) {
        minEntropy = c.entropy;
        lowestEntropyCells.clear();
        lowestEntropyCells.add(c);
      } else if (c.entropy == minEntropy) {
        lowestEntropyCells.add(c);
      }
    }
  }

  // If there are no non-collapsed cells, we're done
  if (lowestEntropyCells.size() == 0) {
    noLoop();
    return;
  }

  // Randomly pick one cell among the lowest-entropy set
  Cell chosen = lowestEntropyCells.get((int) random(lowestEntropyCells.size()));
  chosen.collapsed = true;
  chosen.needsRedraw = true;

  // Pick a random tile index from its possible options
  if (chosen.options.size() == 0) {
    // No valid tile - conflict
    println("Ran into a conflict. Reinitializing.");
    initializeGrid();
    return;
  }
  int pick = chosen.options.get((int) random(chosen.options.size()));

  // Collapse to only that option
  chosen.options.clear();
  chosen.options.add(pick);

  // Propagate constraints to neighbors
  reduceEntropy(grid, chosen, 0);

  // Collapse anything else that now has a single option
  for (Cell c : grid) {
    if (c.options.size() == 1) {
      c.collapsed = true;
      reduceEntropy(grid, c, 0);
    }
  }
}

// Recursively reduce entropy in neighbors
void reduceEntropy(Cell[] grid, Cell cell, int depth) {
  // Stop if we hit max recursion or already checked
  if (depth > MAX_RECURSION_DEPTH || cell.checked) return;
  cell.checked = true;
  cell.needsRedraw = true;

  int index = cell.index;
  int i = index % GRID_SIZE;
  int j = index / GRID_SIZE;

  // Check neighbors in all four directions
  // RIGHT
  if (i + 1 < GRID_SIZE) {
    Cell rightCell = grid[(i + 1) + j * GRID_SIZE];
    if (checkOptions(cell, rightCell, EAST)) {
      reduceEntropy(grid, rightCell, depth + 1);
    }
  }
  // LEFT
  if (i - 1 >= 0) {
    Cell leftCell = grid[(i - 1) + j * GRID_SIZE];
    if (checkOptions(cell, leftCell, WEST)) {
      reduceEntropy(grid, leftCell, depth + 1);
    }
  }
  // DOWN
  if (j + 1 < GRID_SIZE) {
    Cell downCell = grid[i + (j + 1) * GRID_SIZE];
    if (checkOptions(cell, downCell, SOUTH)) {
      reduceEntropy(grid, downCell, depth + 1);
    }
  }
  // UP
  if (j - 1 >= 0) {
    Cell upCell = grid[i + (j - 1) * GRID_SIZE];
    if (checkOptions(cell, upCell, NORTH)) {
      reduceEntropy(grid, upCell, depth + 1);
    }
  }
}

// Check whether neighbor can remain consistent with cell's adjacency
boolean checkOptions(Cell cell, Cell neighbor, int direction) {
  // If neighbor is valid and not collapsed
  if (neighbor != null && !neighbor.collapsed) {
    ArrayList<Integer> validOptions = new ArrayList<Integer>();
    // Gather valid options from the current cell
    for (int optionIndex : cell.options) {
      // For each tile that can appear in cell,
      // union its neighbor set in that direction
      ArrayList<Integer> neighs = tiles.get(optionIndex).neighbors[direction];
      validOptions.addAll(neighs);
    }
    // Filter the neighbor's options
    // so that only valid ones remain
    ArrayList<Integer> newOptions = new ArrayList<Integer>();
    for (int nOpt : neighbor.options) {
      if (validOptions.contains(nOpt)) {
        newOptions.add(nOpt);
      }
    }
    // If the set of neighbor options changed, apply it
    if (newOptions.size() < neighbor.options.size()) {
      neighbor.options = newOptions;
      return true;
    }
  }
  return false;
}
