const tiles = [];
const tileImages = [];

let grid = [];

const DIM = 20;

function preload() {
  const path = "big_shapes";
  tileImages[0] = loadImage(`${path}/1.png`);
  tileImages[1] = loadImage(`${path}/2.png`);
  tileImages[2] = loadImage(`${path}/3.png`);
  tileImages[3] = loadImage(`${path}/4.png`);
  tileImages[4] = loadImage(`${path}/5.png`);
  tileImages[5] = loadImage(`${path}/6.png`);
  tileImages[6] = loadImage(`${path}/7.png`);
  tileImages[7] = loadImage(`${path}/8.png`);
}

function setup() {
  createCanvas(800, 800);
  // randomSeed(1);

  // Loaded and created the tiles
  tiles[0] = new Tile(tileImages[0], [0,0,0,0]);
  tiles[1] = new Tile(tileImages[1], [1,1,1,1]);
  tiles[2] = new Tile(tileImages[2], [0,0,0,0]);
  tiles[3] = new Tile(tileImages[3], [1,1,1,1]);
  tiles[4] = new Tile(tileImages[4], [1,0,0,0]);
  tiles[5] = new Tile(tileImages[5], [0,1,1,1]);
  tiles[6] = new Tile(tileImages[6], [0,0,1,1]);
  tiles[7] = new Tile(tileImages[7], [1,1,0,0]);

  for (let i = 2; i < 14; i++) {
    for (let j = 1; j < 4; j++) {
      tiles.push(tiles[i].rotate(j));
    }
  }

  // tiles[2] = tiles[1].rotate(1);
  // tiles[3] = tiles[1].rotate(2);
  // tiles[4] = tiles[1].rotate(3);

  // Generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  // Create cell for each spot on the grid
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  }
}

function checkValid(arr, valid) {
  //console.log(arr, valid);
  for (let i = arr.length - 1; i >= 0; i--) {
    // VALID: [BLANK, RIGHT]
    // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
    // result in removing UP, DOWN, LEFT
    let element = arr[i];
    // console.log(element, valid.includes(element));
    if (!valid.includes(element)) {
      arr.splice(i, 1);
    }
  }
  // console.log(arr);
  // console.log("----------");
}

function mousePressed() {
  redraw();
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
        image(tiles[index].img, i * w, j * h, w, h);
      } else {
        fill(0);
        stroke(255);
        rect(i * w, j * h, w, h);
      }
    }
  }

  // Pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);
  // console.table(grid);
  // console.table(gridCopy);

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
  cell.options = [pick];

  const nextGrid = [];
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let index = i + j * DIM;
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {
        let options = new Array(tiles.length).fill(0).map((x, i) => i);
        // Look up
        if (j > 0) {
          let up = grid[i + (j - 1) * DIM];
          let validOptions = [];
          for (let option of up.options) {
            let valid = tiles[option].down;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look right
        if (i < DIM - 1) {
          let right = grid[i + 1 + j * DIM];
          let validOptions = [];
          for (let option of right.options) {
            let valid = tiles[option].left;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look down
        if (j < DIM - 1) {
          let down = grid[i + (j + 1) * DIM];
          let validOptions = [];
          for (let option of down.options) {
            let valid = tiles[option].up;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look left
        if (i > 0) {
          let left = grid[i - 1 + j * DIM];
          let validOptions = [];
          for (let option of left.options) {
            let valid = tiles[option].right;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }

        // I could immediately collapse if only one option left?
        nextGrid[index] = new Cell(options);
      }
    }
  }

  grid = nextGrid;
}