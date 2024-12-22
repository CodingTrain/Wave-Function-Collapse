function renderImage(img, x, y, w) {
  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      let index = (i + j * img.width) * 4;
      let r = img.pixels[index + 0];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      fill(r, g, b);
      stroke(0);
      //noStroke();
      strokeWeight(2);
      square(x + i * w, y + j * w, w);
    }
  }

  noFill();
  strokeWeight(1);
  stroke(51);
  square(x, y, img.width * w);
}

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

function copyTile(source, sx, sy, w, dest) {
  dest.loadPixels();
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < w; j++) {
      let pi = (sx + i) % source.width;
      let pj = (sy + j) % source.height;
      let index = (pi + pj * source.width) * 4;
      let r = source.pixels[index + 0];
      let g = source.pixels[index + 1];
      let b = source.pixels[index + 2];
      let a = source.pixels[index + 3];
      let index2 = (i + j * w) * 4;
      dest.pixels[index2 + 0] = r;
      dest.pixels[index2 + 1] = g;
      dest.pixels[index2 + 2] = b;
      dest.pixels[index2 + 3] = a;
    }
  }
  dest.updatePixels();
}

function extractTiles(img) {
  let tiles = [];
  img.loadPixels();
  for (let j = 0; j < endR; j++) {
    for (let i = 0; i < endC; i++) {
      let tileImage = createImage(3, 3);
      // tileImage.copy(img, i, j, 3, 3, 0, 0, 3, 3);
      copyTile(img, i, j, 3, tileImage);
      tiles.push(new Tile(tileImage, tiles.length));
    }
  }
  return tiles;
}
