
// --------------------------------------------
//  Image copying / transformations
// --------------------------------------------

// Extract every possible TILE_SIZE x TILE_SIZE patch from the source image
ArrayList<Tile> extractTiles(PImage img) {
  ArrayList<Tile> tileList = new ArrayList<Tile>();
  // We track unique tiles by hashing pixel data
  Map<String, Tile> uniqueTiles = new HashMap<String, Tile>();

  img.loadPixels();
  int indexCounter = 0;

  for (int j = 0; j < img.height; j++) {
    for (int i = 0; i < img.width; i++) {
      // Copy a sub-tile of size TILE_SIZE x TILE_SIZE
      PImage tileImage = createImage(TILE_SIZE, TILE_SIZE, ARGB);
      copyTile(img, i, j, TILE_SIZE, tileImage);

      // Generate transformations (rotations/reflections)
      ArrayList<PImage> transformations = generateTransformations(tileImage);

      // For each transformation, see if it’s unique
      for (PImage transformed : transformations) {
        String tileKey = hashImage(transformed);
        if (!uniqueTiles.containsKey(tileKey)) {
          Tile newTile = new Tile(transformed, indexCounter);
          uniqueTiles.put(tileKey, newTile);
          indexCounter++;
        } else {
          // If already known, increment frequency
          Tile existing = uniqueTiles.get(tileKey);
          existing.frequency++;
        }
      }
    }
  }
  // Convert from Map to ArrayList
  tileList.addAll(uniqueTiles.values());
  return tileList;
}

// Copy a TILE_SIZE patch from (sx, sy) in source to dest
void copyTile(PImage source, int sx, int sy, int w, PImage dest) {
  dest.loadPixels();
  source.loadPixels();
  for (int j = 0; j < w; j++) {
    for (int i = 0; i < w; i++) {
      int pixelI = (sx + i) % source.width;
      int pixelJ = (sy + j) % source.height;
      int sourceIndex = pixelI + pixelJ * source.width;
      int destIndex = i + j * dest.width;

      dest.pixels[destIndex] = source.pixels[sourceIndex];
    }
  }
  dest.updatePixels();
}

// Rotate an image 90 degrees clockwise
PImage rotateImage(PImage img) {
  PImage rotated = createImage(img.height, img.width, ARGB);
  rotated.loadPixels();
  img.loadPixels();
  for (int y = 0; y < img.height; y++) {
    for (int x = 0; x < img.width; x++) {
      int srcIndex = x + y * img.width;
      int destIndex = (img.height - 1 - y) + x * img.height;
      rotated.pixels[destIndex] = img.pixels[srcIndex];
    }
  }
  rotated.updatePixels();
  return rotated;
}

// Reflect an image horizontally
PImage reflectImage(PImage img) {
  PImage reflected = createImage(img.width, img.height, ARGB);
  reflected.loadPixels();
  img.loadPixels();
  for (int y = 0; y < img.height; y++) {
    for (int x = 0; x < img.width; x++) {
      int srcIndex = x + y * img.width;
      int destIndex = (img.width - 1 - x) + y * img.width;
      reflected.pixels[destIndex] = img.pixels[srcIndex];
    }
  }
  reflected.updatePixels();
  return reflected;
}

// Generate rotations and reflections for one tile
ArrayList<PImage> generateTransformations(PImage tileImage) {
  ArrayList<PImage> transformations = new ArrayList<PImage>();

  // If neither rotations nor reflections are on, just return the tile
  if (!ROTATIONS && !REFLECTIONS) {
    transformations.add(tileImage);
    return transformations;
  }

  // Generate up to 4 rotations
  PImage current = tileImage;
  for (int i = 0; i < 4; i++) {
    current = rotateImage(current);
    transformations.add(current);
  }

  // If no reflections needed, done
  if (!REFLECTIONS) {
    return transformations;
  }

  // Reflect
  PImage reflected = reflectImage(tileImage);
  transformations.add(reflected);

  // Then rotate the reflection
  PImage tmp = reflected;
  for (int i = 0; i < 4; i++) {
    tmp = rotateImage(tmp);
    transformations.add(tmp);
  }
  return transformations;
}

// Create a unique hash key from a PImage's pixel data
String hashImage(PImage img) {
  img.loadPixels();
  StringBuilder sb = new StringBuilder();
  for (int i = 0; i < img.pixels.length; i++) {
    sb.append(img.pixels[i]);
    sb.append(",");
  }
  return sb.toString();
}

// Render only the center pixel of an image
void renderCell(PImage img, float x, float y, float w) {
  img.loadPixels();
  int cx = img.width / 2;
  int cy = img.height / 2;
  int centerIndex = cx + cy * img.width;
  int c = img.pixels[centerIndex];
  fill(red(c), green(c), blue(c));
  noStroke();
  rect(x, y, w, w);
}

// Visualize the entire tile
void renderImage(PImage img, float x, float y, float w) {
  img.loadPixels();
  for (int j = 0; j < img.height; j++) {
    for (int i = 0; i < img.width; i++) {
      int c = img.pixels[i + j * img.width];
      fill(red(c), green(c), blue(c));
      stroke(50);
      rect(x + i * w, y + j * w, w, w);
    }
  }
  noFill();
  strokeWeight(1);
  stroke(0, 255, 255);
  rect(x, y, img.width * w, img.height * w);
}
