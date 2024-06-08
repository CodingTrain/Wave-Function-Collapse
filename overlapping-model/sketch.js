let img;
let tiles = [];
let grid = [];
const tileSize = 3;
const DIM = 40;

let toggle = false;

let rotation = true;

function preload() {
  img = loadImage("samples/ColoredCity.png");
}

function setup() {
  createCanvas(400, 400);
  extractTiles(img);
  createAdjacency();
  textAlign(CENTER, CENTER);
  textSize(20);

  console.log(tiles.length);
  startOver();

  // saveGif("wfc", 1601, {
  //   units: "frames",
  // });
}

function createTile(pixels, tileSize) {
  let ih = new ImageHolder(pixels, tileSize, tileSize);
  let dupe = tiles.find((t) => t.img.repr == ih.repr);
  if (dupe) {
    dupe.freq++;
  } else {
    tiles.push(new Tile(ih, tiles.length));
  }
}

function extractTiles(img) {
  const w = img.width;
  const h = img.height;

  let imgWrap = createImage(w * 2, h * 2);
  imgWrap.copy(img, 0, 0, w, h, 0, 0, w, h);
  imgWrap.copy(img, 0, 0, w, h, w, 0, w, h);
  imgWrap.copy(img, 0, 0, w, h, 0, h, w, h);
  imgWrap.copy(img, 0, 0, w, h, w, h, w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let pattern = createImage(tileSize, tileSize);
      pattern.copy(imgWrap, x, y, tileSize, tileSize, 0, 0, tileSize, tileSize);
      pattern.loadPixels();
      createTile(pattern.pixels, tileSize);

      // add rotations
      if (rotation) {
        let r1pixels = rotateMatrix(pattern.pixels, tileSize, tileSize, 1);
        createTile(r1pixels, tileSize);

        let r2pixels = rotateMatrix(pattern.pixels, tileSize, tileSize, 2);
        createTile(r2pixels, tileSize);

        let r3pixels = rotateMatrix(pattern.pixels, tileSize, tileSize, 3);
        createTile(r3pixels, tileSize);
      }
    }
  }
}

// credit: copilot
function rotateMatrix(pixels, w, h, times) {
  let newPixels = [];
  for (let t = 0; t < times; t++) {
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        let index = (i + j * w) * 4;
        let newIndex = (w - j - 1 + i * w) * 4;
        newPixels[newIndex + 0] = pixels[index + 0];
        newPixels[newIndex + 1] = pixels[index + 1];
        newPixels[newIndex + 2] = pixels[index + 2];
        newPixels[newIndex + 3] = pixels[index + 3];
      }
    }
    pixels = newPixels.slice();
  }
  return newPixels;
}

function createAdjacency() {
  for (const tileA of tiles) {
    for (const tileB of tiles) {
      if (compareHEdge(tileA.img, tileB.img, 1, 0)) {
        tileA.right.push(tileB);
        tileB.left.push(tileA);
      }
      if (compareVEdge(tileA.img, tileB.img, 1, 0)) {
        tileA.bottom.push(tileB);
        tileB.top.push(tileA);
      }
    }
  }
}
function startOver() {
  let seed = Math.floor(random(100000));
  // let seed = 45962;
  randomSeed(seed);
  console.log("Seed: " + seed);
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  }
}
let index = 0;
function draw() {
  // draw all the extracted tiles
  background(0);
  // showAllTiles();
  // for (let i = 0; i < 3; i++)
  wfc();

  // let someTile = tiles[index];
  // let w = width / 10;

  // renderTile(someTile.img, 0, 0, w, w, index);

  // let right = someTile.right;
  // for (let i = 0; i < right.length; i++) {
  //   let x = i % 10;
  //   let y = Math.floor(i / 10) + 2;
  //   renderTile(right[i].img, x * w, y * w, w, w, tiles.indexOf(right[i]));
  // }

  // let left = someTile.left;
  // for (let i = 0; i < left.length; i++) {
  //   let x = i % 10;
  //   let y = Math.floor(i / 10) + 4;
  //   renderTile(left[i].img, x * w, y * w, w, w, tiles.indexOf(left[i]));
  // }

  // let top = someTile.top;
  // for (let i = 0; i < top.length; i++) {
  //   let x = i % 10;
  //   let y = Math.floor(i / 10) + 6;
  //   renderTile(top[i].img, x * w, y * w, w, w, tiles.indexOf(top[i]));
  // }

  // let bottom = someTile.bottom;
  // for (let i = 0; i < bottom.length; i++) {
  //   let x = i % 10;
  //   let y = Math.floor(i / 10) + 8;
  //   renderTile(bottom[i].img, x * w, y * w, w, w, tiles.indexOf(bottom[i]));
  // }

  // let num = Math.floor(width / 40);
  // console.log(tiles);
  // for (let i = 0; i < 100; i++) {
  //   let x = i % num;
  //   let y = Math.floor(i / num);
  //   renderTile(tiles[i].img, x * 40, y * 40, 40, 40, i);
  // }

  // noLoop();
}

function mousePressed() {
  index = (index + 1) % tiles.length;
  redraw();
}

function wfc() {
  const w = width / DIM;
  const h = height / DIM;

  grid.forEach((cell) => (cell.checked = false));

  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid[i + j * DIM];
      // if (cell.collapsed) {
      //   let index = cell.options[0];
      //   if (mouseIsPressed) {
      //     renderTile(tiles[index].img, i * w, j * h, w, h);
      //   } else {
      //     renderCenter(tiles[index].img, i * w, j * h, w, h);
      //   }
      // } else {
      //   noFill();
      //   stroke(51);
      //   rect(i * w, j * h, w, h);
      // }.
      // if (cell.options.length == 1)
      // if (cell.collapsed)
      renderCenter(
        cell.options.map((index) => tiles[index].img),
        i * w,
        j * h,
        w,
        h
      );
    }
  }

  // // // Pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);
  if (gridCopy.length == 0) {
    noLoop();
    console.log("Took " + frameCount + " frames");
    return;
  }
  gridCopy.sort((a, b) => {
    return a.entropy() - b.entropy();
  });

  gridCopy = gridCopy.filter((a) => a.entropy() == gridCopy[0].entropy());

  const cell = random(gridCopy);
  cell.collapsed = true;
  cell.checked = true;
  const pick = weightedRandom(cell.options);

  // if (pick === undefined) {
  //   startOver();
  //   // noLoop();
  //   return;
  // }
  cell.options = [pick];

  breakLoop = false;
  checkNeighbors(cell);
}

let breakLoop = false;
function checkNeighbors(cell, depth = Infinity) {
  if (depth == 0) return;
  // if (queue.length == 0) return;
  if (grid.every((cell) => cell.checked)) return;
  if (breakLoop) return;
  // const cell = queue.pop();
  let toCheck = [];

  let right = getRight(cell);
  if (right && !right.collapsed && !right.checked) {
    const possibleChoices = new Set(
      cell.options.map((i) => tiles[i].right).flat()
    );
    right.options = right.options.filter((a) => possibleChoices.has(tiles[a]));
    right.checked = true;

    // if (right.options.length == 1) {
    //   right.collapsed = true;
    // }

    // queue.push(right);
    toCheck.push(right);

    if (right.options.length == 0) {
      console.log("Contradiction - right");
    }
  }

  let left = getLeft(cell);
  if (left && !left.collapsed && !left.checked) {
    const possibleChoices = new Set(
      cell.options.map((i) => tiles[i].left).flat()
    );
    left.options = left.options.filter((a) => possibleChoices.has(tiles[a]));
    left.checked = true;

    // if (left.options.length == 1) {
    //   left.collapsed = true;
    // }

    // queue.push(left);
    toCheck.push(left);

    if (left.options.length == 0) {
      console.log("Contradiction - left");
    }
  }

  let up = getUp(cell);
  if (up && !up.collapsed && !up.checked) {
    const possibleChoices = new Set(
      cell.options.map((i) => tiles[i].top).flat()
    );
    up.options = up.options.filter((a) => possibleChoices.has(tiles[a]));
    up.checked = true;

    // if (up.options.length == 1) {
    //   up.collapsed = true;
    // }

    // queue.push(up);
    toCheck.push(up);

    if (up.options.length == 0) {
      console.log("Contradiction - up");
    }
  }

  let down = getDown(cell);
  if (down && !down.collapsed && !down.checked) {
    const possibleChoices = new Set(
      cell.options.map((i) => tiles[i].bottom).flat()
    );
    down.options = down.options.filter((a) => possibleChoices.has(tiles[a]));
    down.checked = true;

    // if (down.options.length == 1) {
    //   down.collapsed = true;
    // }

    // queue.push(down);
    toCheck.push(down);

    if (down.options.length == 0) {
      console.log("Contradiction - down");
    }
  }

  if (grid.some((a) => a.options.length == 0)) {
    startOver();
    // const cell = grid.find((a) => a.options.length == 0);
    // const row = Math.floor(cell.index / DIM);
    // const col = cell.index % DIM;
    // fill(255, 0, 0);
    // noStroke();
    // rect((col * width) / DIM, (row * height) / DIM, width / DIM, height / DIM);

    breakLoop = true;
    // noLoop();
    return;
  }

  toCheck.forEach((cell) => checkNeighbors(cell, depth - 1));
  // checkNeighbors(queue, depth - 1);
}

function compareHEdge(a, b, aEdge, bEdge) {
  let same = true;

  for (j = 0; j < 2; j++) {
    for (let i = 0; i < tileSize; i++) {
      let colA = aEdge + (j % tileSize);
      let colB = bEdge + (j % tileSize);
      let aIndex = (colA + i * tileSize) * 4;
      let bIndex = (colB + i * tileSize) * 4;
      let ar = a.pixels[aIndex + 0];
      let br = b.pixels[bIndex + 0];
      let ag = a.pixels[aIndex + 1];
      let bg = b.pixels[bIndex + 1];
      let ab = a.pixels[aIndex + 2];
      let bb = b.pixels[bIndex + 2];
      if (ar != br || ag != bg || ab != bb) {
        same = false;
        break;
      }
    }
  }
  return same;
}

function compareVEdge(a, b, aEdge, bEdge) {
  let same = true;
  for (j = 0; j < 2; j++) {
    for (let i = 0; i < tileSize; i++) {
      let rowA = aEdge + (j % tileSize);
      let rowB = bEdge + (j % tileSize);
      let aIndex = (i + rowA * tileSize) * 4;
      let bIndex = (i + rowB * tileSize) * 4;
      let ar = a.pixels[aIndex + 0];
      let br = b.pixels[bIndex + 0];
      let ag = a.pixels[aIndex + 1];
      let bg = b.pixels[bIndex + 1];
      let ab = a.pixels[aIndex + 2];
      let bb = b.pixels[bIndex + 2];
      if (ar != br || ag != bg || ab != bb) {
        same = false;
        break;
      }
    }
  }
  return same;
}

function renderCenter(patterns, x, y, w, h) {
  let r = 0,
    g = 0,
    b = 0;
  for (const pattern of patterns) {
    // pattern.loadPixels();
    // hardcoding center pixel
    let i = 1;
    let j = 1;
    let index = (i + j * tileSize) * 4;
    r += pattern.pixels[index + 0];
    g += pattern.pixels[index + 1];
    b += pattern.pixels[index + 2];
    // fill(r, g, b);
    // noStroke();
    // rect(x, y, w, h);
  }
  r /= patterns.length;
  g /= patterns.length;
  b /= patterns.length;
  fill(r, g, b);
  noStroke();
  rect(x, y, w, h);

  // noFill();
  // stroke(255, 0, 0);
  // rect(x, y, w, h);
}

function renderTile(pattern, x, y, w, h, i) {
  stroke(0);
  strokeWeight(3);
  noFill();
  rect(x, y, w, h);
  for (let i = 0; i < tileSize; i++) {
    for (let j = 0; j < tileSize; j++) {
      let index = (i + j * tileSize) * 4;
      const r = pattern.pixels[index + 0];
      const g = pattern.pixels[index + 1];
      const b = pattern.pixels[index + 2];
      fill(r, g, b);
      noStroke();
      rect(
        x + (i * w) / tileSize,
        y + (j * h) / tileSize,
        w / tileSize,
        h / tileSize
      );
    }
  }
  fill(0);

  text(i, x, y, w, h);
  // noFill();
  // stroke(255, 0, 0);
  // rect(x, y, w, h);
}

function getRight(cell) {
  let nx, ny;
  for (i = 0; i < DIM; i++) {
    for (j = 0; j < DIM; j++) {
      let index = i + j * DIM;
      if (grid[index] == cell) {
        nx = i + 1;
        ny = j;
      }
    }
  }
  // if (nx < 0 || nx >= DIM || ny < 0 || ny >= DIM) return null;
  nx = (nx + DIM) % DIM;
  ny = (ny + DIM) % DIM;
  return grid[nx + ny * DIM];
}

function getLeft(cell) {
  let nx, ny;
  for (i = 0; i < DIM; i++) {
    for (j = 0; j < DIM; j++) {
      let index = i + j * DIM;
      if (grid[index] == cell) {
        nx = i - 1;
        ny = j;
      }
    }
  }
  // if (nx < 0 || nx >= DIM || ny < 0 || ny >= DIM) return null;.
  nx = (nx + DIM) % DIM;
  ny = (ny + DIM) % DIM;
  return grid[nx + ny * DIM];
}

function getUp(cell) {
  let nx, ny;
  for (i = 0; i < DIM; i++) {
    for (j = 0; j < DIM; j++) {
      let index = i + j * DIM;
      if (grid[index] == cell) {
        nx = i;
        ny = j - 1;
      }
    }
  }
  // if (nx < 0 || nx >= DIM || ny < 0 || ny >= DIM) return null;
  nx = (nx + DIM) % DIM;
  ny = (ny + DIM) % DIM;
  return grid[nx + ny * DIM];
}

function getDown(cell) {
  let nx, ny;
  for (i = 0; i < DIM; i++) {
    for (j = 0; j < DIM; j++) {
      let index = i + j * DIM;
      if (grid[index] == cell) {
        nx = i;
        ny = j + 1;
      }
    }
  }
  // if (nx < 0 || nx >= DIM || ny < 0 || ny >= DIM) return null;
  nx = (nx + DIM) % DIM;
  ny = (ny + DIM) % DIM;
  return grid[nx + ny * DIM];
}

function weightedRandom(options) {
  const currTiles = options.map((i) => tiles[i]);
  const sum = currTiles.map((t) => t.freq).reduce((a, b) => a + b, 0);
  const rand = random(sum);
  let total = 0;
  for (let i = 0; i < currTiles.length; i++) {
    total += currTiles[i].freq;
    if (rand < total) {
      return options[i];
    }
  }
}
