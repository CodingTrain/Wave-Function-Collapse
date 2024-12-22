
void wfc() {
  // Make a copy of the grid and remove collapsed cells
  ArrayList<Cell> gridCopy = new ArrayList<Cell>();
  for (Cell cell : grid) {
    if (!cell.collapsed) {
      gridCopy.add(cell);
    }
  }

  // Check if the algorithm has completed
  if (gridCopy.size() == 0) {
    println("Done!");
    noLoop();
    return;
  }

  // Calculate entropy for each cell
  for (Cell cell : gridCopy) {
    cell.entropy = calculateEntropy(cell.options);
  }

  // Sort cells based on entropy
  Collections.sort(gridCopy, new Comparator<Cell>() {
    public int compare(Cell a, Cell b) {
      return Float.compare(a.entropy, b.entropy);
    }
  });

  // Find cells with minimum entropy
  float minEntropy = gridCopy.get(0).entropy;
  ArrayList<Cell> leastEntropyCells = new ArrayList<Cell>();
  for (Cell cell : gridCopy) {
    if (cell.entropy > minEntropy) {
      break;
    }
    leastEntropyCells.add(cell);
  }

  // Collapse a random cell from those with minimum entropy
  Cell cell = leastEntropyCells.get((int) random(leastEntropyCells.size()));
  cell.collapsed = true;

  // Choose an option weighted by frequency
  int pickedOption = pickWeightedOption(cell.options);
  cell.options.clear();
  cell.options.add(pickedOption);

  // Propagate constraints
  reduceEntropy(cell);
}

float calculateEntropy(HashSet<Integer> options) {
  float totalFrequency = 0;
  for (int option : options) {
    totalFrequency += tiles.get(option).frequency;
  }
  float entropy = 0;
  for (int option : options) {
    float p = tiles.get(option).frequency / totalFrequency;
    entropy -= p * log(p);
  }
  return entropy;
}

int pickWeightedOption(HashSet<Integer> options) {
  float totalFrequency = 0;
  for (int option : options) {
    totalFrequency += tiles.get(option).frequency;
  }
  float rand = random(totalFrequency);
  float cumulative = 0;
  for (int option : options) {
    cumulative += tiles.get(option).frequency;
    if (rand < cumulative) {
      return option;
    }
  }
  // Should not reach here
  return options.iterator().next();
}

void reduceEntropy(Cell startCell) {
  LinkedList<Cell> queue = new LinkedList<Cell>();
  queue.add(startCell);

  while (!queue.isEmpty()) {
    Cell cell = queue.removeFirst();
    int index = cell.index;
    int i = index % DIM;
    int j = index / DIM;

    // Define directions
    int[][] directions = {
      {1, 0, TRIGHT},
      {-1, 0, TLEFT},
      {0, -1, TUP},
      {0, 1, TDOWN}
    };

    for (int[] dir : directions) {
      int ni = i + dir[0];
      int nj = j + dir[1];
      int ndir = dir[2];
      if (ni >= 0 && ni < DIM && nj >= 0 && nj < DIM) {
        Cell neighbor = grid.get(ni + nj * DIM);
        if (!neighbor.collapsed) {
          boolean changed = checkOptions(cell, neighbor, ndir);
          if (changed && !neighbor.checked) {
            neighbor.checked = true;
            queue.add(neighbor);
          }
        }
      }
    }
  }
}

boolean checkOptions(Cell cell, Cell neighbor, int direction) {
  HashSet<Integer> validOptions = new HashSet<Integer>();
  for (int option : cell.options) {
    validOptions.addAll(tiles.get(option).neighbors[direction]);
  }
  int previousSize = neighbor.options.size();
  neighbor.options.retainAll(validOptions);
  if (neighbor.options.size() == 0) {
    // Conflict: No valid options left
    neighbor.collapsed = true;
    neighbor.options.clear();
    neighbor.options.add(tiles.size() - 1); // Assign an error tile if needed
    return false;
  }
  if (neighbor.options.size() != previousSize) {
    neighbor.entropy = calculateEntropy(neighbor.options);
    return true;
  }
  return false;
}
