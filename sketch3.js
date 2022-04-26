const tiles = [];
const tileImages = [];

let grid = [];

const DIM = 10;

function preload() {
  const path = "purple";
  for (let i = 0; i < 14; i++) {
    tileImages[i] = loadImage(`${path}/${i}.png`);
  }
}

function setup() {
  createCanvas(800, 800);

  // Loaded and created the tiles
  tiles[0] = new Tile(tileImages[0], ["PPP", "PPP", "PPP", "PPP"]);
  tiles[1] = new Tile(tileImages[1], ["MMM", "MMM", "MMM", "MMM"]);
  tiles[2] = new Tile(tileImages[2], ["MMM", "PPP", "PPP", "MMM"]);
  tiles[3] = new Tile(tileImages[3], ["PPP", "MMM", "MMM", "PPP"]);
  tiles[4] = new Tile(tileImages[4], ["MMM", "PPP", "PPP", "PPP"]);
  tiles[5] = new Tile(tileImages[5], ["PPP", "MMM", "MMM", "MMM"]);
  tiles[6] = new Tile(tileImages[6], ["MMM", "MMM", "MMM", "MMM"]);
  tiles[7] = new Tile(tileImages[7], ["PPP", "PPP", "PPP", "PPP"]);
  tiles[8] = new Tile(tileImages[8], ["MPM", "MMM", "MPM", "MMM"]);
  tiles[9] = new Tile(tileImages[9], ["PMP", "PPP", "PMP", "PPP"]);
  tiles[10] = new Tile(tileImages[10], ["MPM", "MPM", "MPM", "MPM"]);
  tiles[11] = new Tile(tileImages[11], ["PMP", "PMP", "PMP", "PMP"]);
  tiles[12] = new Tile(tileImages[12], ["PMM", "MMM", "MMP", "PPP"]);
  tiles[13] = new Tile(tileImages[13], ["MMP", "PPP", "PPM", "MMM"]);
  //tiles[14] = new Tile(tileImages[14], ["MPM", "MPM", "MPM", "MPM"]);
  //tiles[15] = new Tile(tileImages[15], ["PMP", "PMP", "PMP", "PMP"]);
  // tiles[16] = new Tile(tileImages[16], ["MMP", "PMM", "MMP", "PMM"]);
  // tiles[17] = new Tile(tileImages[17], ["PPM", "MPP", "PPM", "MPP"]);

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

  startOver();
}

function startOver() {
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
  if (pick === undefined) {
    startOver();
    return;
  }
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
