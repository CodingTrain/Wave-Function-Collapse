

  // Class for each cell in the grid
  class Cell {
    ArrayList<Integer> options = new ArrayList<>();
    boolean collapsed = false;

    // Constructor can take an int (number of possible tiles) or 
    // an ArrayList of options
    Cell(int numOptions) {
      for (int i = 0; i < numOptions; i++) {
        options.add(i);
      }
    }

    Cell(ArrayList<Integer> opts) {
      options.addAll(opts);
    }
  }
