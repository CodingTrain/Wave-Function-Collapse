
//void renderCell(PImage img, float x, float y, float w) {
//  image(img, x, y, w, w);
//}


void renderCell(PImage img, float x, float y, float w) {
  int i = img.width / 2;
  int j = img.height / 2;
  int index = i + j * img.width;
  int col = img.pixels[index];
  fill(col);
  noStroke();
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
  HashMap<String, Tile> uniqueTiles = new HashMap<>();
  img.loadPixels();
  for (int j = 0; j < img.height - 2; j++) {
    for (int i = 0; i < img.width - 2; i++) {
      PImage tileImage = createImage(3, 3, RGB);
      copyTile(img, i, j, 3, tileImage);
      String tileHash = getTileHash(tileImage);
      if (uniqueTiles.containsKey(tileHash)) {
        uniqueTiles.get(tileHash).frequency++;
      } else {
        Tile newTile = new Tile(tileImage, uniqueTiles.size());
        uniqueTiles.put(tileHash, newTile);
      }
    }
  }
  return new ArrayList<>(uniqueTiles.values());
}

String getTileHash(PImage img) {
  StringBuilder sb = new StringBuilder();
  img.loadPixels();
  for (int i = 0; i < img.pixels.length; i++) {
    sb.append(img.pixels[i]);
    sb.append(",");
  }
  return sb.toString();
}
