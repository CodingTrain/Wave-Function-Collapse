
boolean differentColor(PImage imgA, int indexA, PImage imgB, int indexB) {
  int colorA = imgA.pixels[indexA];
  int colorB = imgB.pixels[indexB];
  return colorA != colorB;
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
