// Render an image with "block" pixels
function renderImage(img, x, y, w) {
  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      let index = (i + j * img.width) * 4;
      let r = img.pixels[index + 0];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      fill(r, g, b);
      stroke(50);
      square(x + i * w, y + j * w, w);
    }
  }

  noFill();
  strokeWeight(1);
  stroke(0, 255, 255);
  square(x, y, img.width * w);
}

// Render only the center pixel of an image
function renderCell(img, x, y, w) {
  let i = floor(img.width / 2);
  let j = floor(img.width / 2);
  let index = (i + j * img.width) * 4;
  let r = img.pixels[index + 0];
  let g = img.pixels[index + 1];
  let b = img.pixels[index + 2];
  fill(r, g, b);
  noStroke();
  square(x, y, w);
}

// Extract tiles from the source image
function extractTiles(img) {
  // Use an object to keep track of unique tiles
  let uniqueTiles = {};

  img.loadPixels();
  let indexCounter = 0;
  for (let j = 0; j < img.height; j++) {
    for (let i = 0; i < img.width; i++) {
      // Create a new image for each tile
      let tileImage = createImage(TILE_SIZE, TILE_SIZE);
      // Copy segment of source image
      copyTile(img, i, j, TILE_SIZE, tileImage);

      let transformations = generateTransformations(tileImage);

      for (let transformedImage of transformations) {
        // Is this tile unique??
        let tileKey = transformedImage.canvas.toDataURL();
        if (!uniqueTiles[tileKey]) {
          uniqueTiles[tileKey] = new Tile(transformedImage, indexCounter);
          indexCounter++;
        } else {
          uniqueTiles[tileKey].frequency++;
        }
      }
    }
  }
  return Object.values(uniqueTiles);
}

// Copy a tile from a source image to a new image
function copyTile(source, sx, sy, w, dest) {
  dest.loadPixels();
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < w; j++) {
      let pixelI = (sx + i) % source.width;
      let pixelJ = (sy + j) % source.height;
      let sourceIndex = (pixelI + pixelJ * source.width) * 4;
      let r = source.pixels[sourceIndex + 0];
      let g = source.pixels[sourceIndex + 1];
      let b = source.pixels[sourceIndex + 2];
      let a = source.pixels[sourceIndex + 3];
      let destIndex = (i + j * dest.width) * 4;
      dest.pixels[destIndex + 0] = r;
      dest.pixels[destIndex + 1] = g;
      dest.pixels[destIndex + 2] = b;
      dest.pixels[destIndex + 3] = a;
    }
  }
  dest.updatePixels();
}

// Rotate an image 90 degrees clockwise
function rotateImage(img) {
  let rotatedImage = createImage(img.height, img.width);
  rotatedImage.loadPixels();
  img.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let srcIndex = (x + y * img.width) * 4;
      // New pixel index for rotation
      let destIndex = (img.height - 1 - y + x * img.height) * 4;
      rotatedImage.pixels[destIndex + 0] = img.pixels[srcIndex + 0];
      rotatedImage.pixels[destIndex + 1] = img.pixels[srcIndex + 1];
      rotatedImage.pixels[destIndex + 2] = img.pixels[srcIndex + 2];
      rotatedImage.pixels[destIndex + 3] = img.pixels[srcIndex + 3];
    }
  }
  rotatedImage.updatePixels();
  return rotatedImage;
}

// Reflect an image horizontally
function reflectImage(img) {
  let reflectedImage = createImage(img.width, img.height);
  reflectedImage.loadPixels();
  img.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let srcIndex = (x + y * img.width) * 4;
      // New pixel index for reflection
      let destIndex = (img.width - 1 - x + y * img.width) * 4;
      reflectedImage.pixels[destIndex + 0] = img.pixels[srcIndex + 0];
      reflectedImage.pixels[destIndex + 1] = img.pixels[srcIndex + 1];
      reflectedImage.pixels[destIndex + 2] = img.pixels[srcIndex + 2];
      reflectedImage.pixels[destIndex + 3] = img.pixels[srcIndex + 3];
    }
  }
  reflectedImage.updatePixels();
  return reflectedImage;
}

// Create all the rotations and reflections of one tile image
function generateTransformations(tileImage) {
  let transformations = [];
  let currentImage = tileImage;

  // If no rotations or reflections are needed
  if (!ROTATIONS && !REFLECTIONS) {
    transformations.push(currentImage);
    return transformations;
  }

  // Generate rotations
  for (let i = 0; i < 4; i++) {
    currentImage = rotateImage(currentImage);
    transformations.push(currentImage);
  }

  // If no reflections are needed
  if (!REFLECTIONS) {
    return transformations;
  }

  // Generate the reflection
  let reflectedImage = reflectImage(tileImage);
  currentImage = reflectedImage;
  transformations.push(currentImage);

  // And then the rotations of the reflection
  for (let i = 0; i < 4; i++) {
    currentImage = rotateImage(currentImage);
    transformations.push(currentImage);
  }

  // Return all of the tile transformations
  return transformations;
}
