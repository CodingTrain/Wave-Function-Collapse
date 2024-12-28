
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

PImage rotateImage(PImage img) {
  PImage rotated = createImage(3, 3, RGB);
  rotated.loadPixels();
  img.loadPixels();
  for (int x = 0; x < 3; x++) {
    for (int y = 0; y < 3; y++) {
      int srcIndex = x + y * 3;
      int destIndex = (2 - y) + x * 3; // Rotate 90 degrees
      rotated.pixels[destIndex] = img.pixels[srcIndex];
    }
  }
  rotated.updatePixels();
  return rotated;
}

PImage reflectImage(PImage img) {
  PImage reflected = createImage(3, 3, RGB);
  reflected.loadPixels();
  img.loadPixels();
  for (int x = 0; x < 3; x++) {
    for (int y = 0; y < 3; y++) {
      int srcIndex = x + y * 3;
      int destIndex = (2 - x) + y * 3; // Reflect horizontally
      reflected.pixels[destIndex] = img.pixels[srcIndex];
    }
  }
  reflected.updatePixels();
  return reflected;
}

ArrayList<Tile> extractTiles(PImage img) {
  ArrayList<Tile> tiles = new ArrayList<Tile>();
  HashMap<String, Tile> tileDict = new HashMap<String, Tile>();
  img.loadPixels();
  for (int j = 0; j < img.height; j++) {
    for (int i = 0; i < img.width; i++) {
      PImage tileImage = createImage(3, 3, RGB);
      copyTile(img, i, j, 3, tileImage);

      ArrayList<PImage> transformations = generateTransformations(tileImage);
      for (PImage t : transformations) {
        String key = Base64.getEncoder().encodeToString(convertToByteArray(t.pixels));
        if (tileDict.containsKey(key)) {
          tileDict.get(key).frequency++;
        } else {
          Tile newTile = new Tile(t, tiles.size());
          tiles.add(newTile);
          tileDict.put(key, newTile);
        }
      }
    }
  }
  return tiles;
}

byte[] convertToByteArray(int[] pixels) {
  ByteBuffer buffer = ByteBuffer.allocate(pixels.length * 4);
  for (int pixel : pixels) {
    buffer.putInt(pixel);
  }
  return buffer.array();
}


ArrayList<PImage> generateTransformations(PImage tileImage) {
  ArrayList<PImage> transformations = new ArrayList<PImage>();
  PImage currentImage = tileImage;
  transformations.add(currentImage);
  return transformations;

  //for (int k = 0; k < 4; k++) {
  //  currentImage = rotateImage(currentImage);
  //  transformations.add(currentImage);
  //}

  //PImage reflectedImage = reflectImage(tileImage);
  //currentImage = reflectedImage;

  //for (int k = 0; k < 4; k++) {
  //  currentImage = rotateImage(currentImage);
  //  transformations.add(currentImage);
  //}

  //return transformations;
}
