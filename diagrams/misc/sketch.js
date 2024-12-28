function setup() {
  createCanvas(1200, 400);
  background(255);
  textFont('Courier', 16);

  let w = 25;
  let h = 25;
  translate(25, 0);
  for (let x = 0; x < 40; x++) {
    let x1 = x * w + w;
    let y1 = 20;
    strokeWeight(2);
    noFill();
    stroke(0);
    rect(x1, y1, w, h);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    let arr = ['R', 'G', 'B', 'A'];
    textSize(16);
    text(arr[x % 4], x1 + w / 2, y1 + h / 2);
    textSize(12);
    text(nf(x, 2), x1 + w / 2, y1 + h * 1.5);
  }
  w = 50;
  h = 50;
  translate(25, 75);

  // draw a 5 x 4 grid of rectangles
  for (let x = 0; x < 5; x++) {
    let x1 = x * w + w;
    textSize(16);
    text(x, x1 + w / 2, w - h / 4);
    for (let y = 0; y < 4; y++) {
      let y1 = y * h + w;
      strokeWeight(2);
      stroke(0);
      noFill();
      rect(x1, y1, w, h);
      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(16);
      if (x == 2 && y == 1) {
        //text(`${x},${y}`, x1 + w / 2, y1 + h / 2);
        text(`x,y`, x1 + w / 2, y1 + h / 2);
      }
    }
  }
  for (let y = 0; y < 4; y++) {
    let y1 = y * h + w;

    text(y, 30, y1 + h / 2);
  }
}
