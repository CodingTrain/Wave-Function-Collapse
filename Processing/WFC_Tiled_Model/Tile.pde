// Class for each tile
class Tile {
  PImage img;
  String[] edges;
  int index;
  ArrayList<Integer> up   = new ArrayList<>();
  ArrayList<Integer> right= new ArrayList<>();
  ArrayList<Integer> down = new ArrayList<>();
  ArrayList<Integer> left = new ArrayList<>();

  Tile(PImage img, String[] edges) {
    this.img = img;
    this.edges = edges;
  }

  Tile(PImage img, String[] edges, int index) {
    this.img = img;
    this.edges = edges;
    this.index = index;
  }

  // Analyze and find which other tiles can be in each direction
  void analyze(ArrayList<Tile> allTiles) {
    // For every tile in allTiles
    for (int i = 0; i < allTiles.size(); i++) {
      Tile other = allTiles.get(i);

      // Check if the current tile's bottom edge (edges[2])
      // matches 'other' tile's top edge (edges[0])
      if (compareEdge(other.edges[2], this.edges[0])) {
        up.add(i);
      }
      // Check if the current tile's left edge (edges[3])
      // matches 'other' tile's right edge (edges[1])
      if (compareEdge(other.edges[3], this.edges[1])) {
        right.add(i);
      }
      // Check if the current tile's top edge (edges[0])
      // matches 'other' tile's bottom edge (edges[2])
      if (compareEdge(other.edges[0], this.edges[2])) {
        down.add(i);
      }
      // Check if the current tile's right edge (edges[1])
      // matches 'other' tile's left edge (edges[3])
      if (compareEdge(other.edges[1], this.edges[3])) {
        left.add(i);
      }
    }
  }

  // Rotate the tile image and edges
  // 'num' can be 0,1,2,3 (multiples of 90 degrees)
  Tile rotate(int num) {
    int w = img.width;
    int h = img.height;
    PGraphics newImg = createGraphics(w, h);
    newImg.beginDraw();
    newImg.imageMode(CENTER);
    newImg.translate(w / 2f, h / 2f);
    newImg.rotate(HALF_PI * num);
    newImg.image(img, 0, 0);
    newImg.endDraw();

    // Rotate edges
    String[] newEdges = new String[edges.length];
    int length = edges.length;
    for (int i = 0; i < length; i++) {
      // Note that (i - num + length) % length shifts the edges
      newEdges[i] = edges[(i - num + length) % length];
    }
    return new Tile(newImg, newEdges, this.index);
  }
}
