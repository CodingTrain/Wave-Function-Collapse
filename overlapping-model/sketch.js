let img;
let tiles = [];
let grid = [];
const tileSize = 3;
const DIM = 25;

function preload() {
  img = loadImage('flowers.png');
}

function setup() {
  createCanvas(400, 400);
  extractTiles(img);
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

function startOver() {
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  }
}

function draw() {
  background(0);
  const w = width / DIM;
  const h = height / DIM;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid[i + j * DIM];
      if (cell.collapsed) {
        let index = cell.options[0];
        render(tiles[index].img, i * w, j * h, w, h);
      } else {
        noFill();
        stroke(51);
        rect(i * w, j * h, w, h);
      }
    }
  }
  // // Pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);
  if (gridCopy.length == 0) {
    return;
  }
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }
  if (stopIndex > 0) gridCopy.splice(stopIndex);

  const cell = random(gridCopy);
  cell.collapsed = true;
  const pick = random(cell.options);
  // if (pick === undefined) {
  //   // startOver();
  //   noLoop();
  //   return;
  // }
  cell.options = [pick];
  const nextGrid = [];
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let index = i + j * DIM;
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {
        let options = new Array(tiles.length).fill(0).map((x, i) => i);
        let validOptions = [];
        // let's look to the right:
        let nx = i + 1;
        let ny = j;
        if (nx < DIM) {
          const neighbor = grid[nx + ny * DIM];
          if (neighbor.collapsed) {
            const nState = neighbor.options[0];
            for (const option of options) {
              if (compareHEdge(tiles[option].img, tiles[nState].img, 0, 2)) {
                validOptions.push(option);
              }
            }
          }
        }

        // Let's look to the left:
        nx = i - 1;
        if (nx >= 0) {
          const neighbor = grid[nx + ny * DIM];
          if (neighbor.collapsed) {
            const nState = neighbor.options[0];
            let tempValidOptions = [];
            let possibleOptions = options;
            if (validOptions.length > 0) {
              possibleOptions = validOptions;
            }
            for (const option of possibleOptions) {
              if (compareHEdge(tiles[option].img, tiles[nState].img, 2, 0)) {
                tempValidOptions.push(option);
              }
            }
            validOptions = tempValidOptions;
          }
        }

        // Let's look up:
        nx = i;
        ny = j - 1;
        if (ny >= 0) {
          const neighbor = grid[nx + ny * DIM];
          if (neighbor.collapsed) {
            const nState = neighbor.options[0];
            let tempValidOptions = [];
            let possibleOptions = options;
            if (validOptions.length > 0) {
              possibleOptions = validOptions;
            }
            for (const option of possibleOptions) {
              if (compareVEdge(tiles[option].img, tiles[nState].img, 0, 2)) {
                tempValidOptions.push(option);
              }
            }
            validOptions = tempValidOptions;
          }
        }

        // Let's look down:
        nx = i;
        ny = j + 1;
        if (ny < DIM) {
          const neighbor = grid[nx + ny * DIM];
          if (neighbor.collapsed) {
            const nState = neighbor.options[0];
            let tempValidOptions = [];
            let possibleOptions = options;
            if (validOptions.length > 0) {
              possibleOptions = validOptions;
            }
            for (const option of possibleOptions) {
              if (compareVEdge(tiles[option].img, tiles[nState].img, 2, 0)) {
                tempValidOptions.push(option);
              }
            }
            validOptions = tempValidOptions;
          }
        }

        if (validOptions.length == 0) {
          validOptions = options;
        }
        nextGrid[index] = new Cell(validOptions);
      }
    }
  }
  grid = nextGrid;
}

function compareHEdge(a, b, aEdge, bEdge) {
  a.loadPixels();
  b.loadPixels();
  let same = true;
  for (let i = 0; i < tileSize; i++) {
    let aIndex = (aEdge + i * tileSize) * 4;
    let bIndex = (bEdge + i * tileSize) * 4;
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
  return same;
}

function compareVEdge(a, b, aEdge, bEdge) {
  a.loadPixels();
  b.loadPixels();
  let same = true;
  for (let i = 0; i < tileSize; i++) {
    let aIndex = (i + aEdge * tileSize) * 4;
    let bIndex = (i + bEdge * tileSize) * 4;
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
  return same;
}

function render(pattern, x, y, w, h) {
  pattern.loadPixels();
  for (let i = 0; i < tileSize; i++) {
    for (let j = 0; j < tileSize; j++) {
      let index = (i + j * tileSize) * 4;
      const r = pattern.pixels[index + 0];
      const g = pattern.pixels[index + 1];
      const b = pattern.pixels[index + 2];
      fill(r, g, b);
      noStroke();
      rect(x + (i * w) / tileSize, y + (j * h) / tileSize, w / tileSize, h / tileSize);
    }
  }
}
