let img;
let tiles = [];
let grid = [];
const tileSize = 3;
const DIM = 40;

let toggle = false;

function preload() {
  img = loadImage("flowers.png");
}

function setup() {
  createCanvas(400, 400);
  extractTiles(img);
  createAdjacency();
  tiles = tiles.filter((tile) => {
    return (
      tile.bottom.length > 0 &&
      tile.top.length > 0 &&
      tile.left.length > 0 &&
      tile.right.length > 0
    );
  });
  startOver();
}

function extractTiles(img) {
  const w = img.width;
  const h = img.height;

  for (let y = 0; y <= h - tileSize; y++) {
    for (let x = 0; x <= w - tileSize; x++) {
      let pattern = createImage(tileSize, tileSize);
      pattern.copy(img, x, y, tileSize, tileSize, 0, 0, tileSize, tileSize);
      tiles.push(new Tile(pattern, tiles.length));
    }
  }
}

function createAdjacency() {
  for (const tileA of tiles) {
    for (const tileB of tiles) {
      tileA.img.loadPixels();
      tileB.img.loadPixels();
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
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  }
}

function draw() {
  // draw all the extracted tiles
  background(0);
  // showAllTiles();

  // performance.mark("start");
  wfc();
  // performance.mark("end");
  // console.log(performance.measure("wfc", "start", "end"));

  // let t = random(tiles);
  // let w = 20;
  // renderTile(t.img, 0, 0, w, w);

  // // compare t to all other tiles right horizontal edge
  // let x = w;
  // let y = 0;
  // for (let i = 0; i < tiles.length; i++) {
  //   let other = tiles[i];
  //   if (compareVEdge(t.img, other.img, 1, 0)) {
  //     renderTile(other.img, x, y, w, w);
  //     y += w;
  //     if (y > height) {
  //       y = 0;
  //       x += w;
  //     }
  //   }
  // }

  // noLoop();
}

function showAllTiles() {
  let x = 0;
  let y = 0;
  const w = width / DIM;
  const h = height / DIM;

  for (let i = 0; i < tiles.length; i++) {
    render(tiles[i].img, x, y, w, h);
    x += w;
    if (x > width) {
      x = 0;
      y += h;
    }
  }

  translate(0, height / 2);
  // draw the original image with each pixel w,h
  img.loadPixels();
  let pw = w / 3;
  let ph = h / 3;

  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      let index = (i + j * img.width) * 4;
      const r = img.pixels[index + 0];
      const g = img.pixels[index + 1];
      const b = img.pixels[index + 2];
      fill(r, g, b);
      noStroke();
      rect(i * pw, j * ph, pw, ph);
    }
  }
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
      renderCenter(
        cell.options.map((index) => tiles[index].img),
        i * w,
        j * h,
        w,
        h
      );
    }
  }

  // // Pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);
  if (gridCopy.length == 0) {
    noLoop();
    return;
  }
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  gridCopy = gridCopy.filter(
    (a) => a.options.length == gridCopy[0].options.length
  );

  const cell = random(gridCopy);
  cell.collapsed = true;
  cell.checked = true;
  const pick = random(cell.options);
  // if (pick === undefined) {
  //   startOver();
  //   // noLoop();
  //   return;
  // }
  cell.options = [pick];

  breakLoop = false;
  checkNeighbors([cell]);
}

let breakLoop = false;
function checkNeighbors(queue, depth = Infinity) {
  if (depth == 0) return;
  if (queue.length == 0) return;
  if (grid.every((cell) => cell.checked || cell.collapsed)) return;
  if (breakLoop) return;
  const cell = queue.pop();

  let right = getRight(cell);
  if (right && !right.collapsed && !right.checked) {
    const possibleChoices = new Set(
      cell.options.map((i) => tiles[i].right).flat()
    );
    right.options = right.options.filter((a) => possibleChoices.has(tiles[a]));
    right.checked = true;

    if (right.options.length == 1) {
      right.collapsed = true;
    }

    queue.push(right);

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

    if (left.options.length == 1) {
      left.collapsed = true;
    }

    queue.push(left);

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

    if (up.options.length == 1) {
      up.collapsed = true;
    }

    queue.push(up);

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

    if (down.options.length == 1) {
      down.collapsed = true;
    }

    queue.push(down);

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

  checkNeighbors(queue, depth - 1);
}

function compareHEdge(a, b, aEdge, bEdge) {
  a.loadPixels();
  b.loadPixels();
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
  a.loadPixels();
  b.loadPixels();
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

function renderTile(pattern, x, y, w, h) {
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
  if (nx < 0 || nx >= DIM || ny < 0 || ny >= DIM) return null;
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
  if (nx < 0 || nx >= DIM || ny < 0 || ny >= DIM) return null;
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
  if (nx < 0 || nx >= DIM || ny < 0 || ny >= DIM) return null;
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
  if (nx < 0 || nx >= DIM || ny < 0 || ny >= DIM) return null;
  return grid[nx + ny * DIM];
}
