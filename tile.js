function reverseString(s) {
  let arr = s.split("");
  arr = arr.reverse();
  return arr.join("");
}

function compareEdge(a, b) {
  return a == reverseString(b);
}

class Tile {
  constructor(img, edges, solderMaskColor = 'none') {
    this.img = img;
    this.edges = edges;
    this.up = [];
    this.right = [];
    this.down = [];
    this.left = [];
    if(solderMaskColor !== 'none') {
      this.changeColor(solderMaskColor);
    }
  }

  /**
   * Changes the Color of the Sodlermask of the Tiles
   *
   * @param color The input color as string
   * @returns void
   */
  changeColor(color) {
    let cArray = this.getColorAsArray(color);
    if(!cArray) return;
    let copper = [141, 73, 49];
    let alpha = 0.5;

    this.img.loadPixels();
    for(let i = 0; i < 4 * (this.img.width * this.img.height); i+= 4) {
      if(
        this.img.pixels[i]   == 5   /* R-Value of solder in circuit tiles */ &&
        this.img.pixels[i+1] == 105 /* G-Value of solder in circuit tiles */ &&
        this.img.pixels[i+2] == 10  /* B-Value of solder in circuit tiles */
      ) {
        this.img.pixels[i]   = cArray[0];
        this.img.pixels[i+1] = cArray[1];
        this.img.pixels[i+2] = cArray[2];
      } else if(
        this.img.pixels[i]   == 0   /* R-Value of conductor track in circuit tiles */ &&
        this.img.pixels[i+1] == 208 /* G-Value of conductor track in circuit tiles */ &&
        this.img.pixels[i+2] == 122 /* B-Value of conductor track in circuit tiles */
      ) {
        this.img.pixels[i]   = this.blendColors(copper[0], cArray[0], alpha);
        this.img.pixels[i+1] = this.blendColors(copper[1], cArray[1], alpha);
        this.img.pixels[i+2] = this.blendColors(copper[2], cArray[2], alpha);
      }
    }
    this.img.updatePixels();
  }

  /**
   *  Blends between 2 colors
   *
   * @param baseColor  The background color
   * @param blendColor The color do add on top
   * @param amount     The amount of the color to add (1 = only blendColor; 0 = only baseColor)
   * @returns
   */
  blendColors(baseColor, blendColor, amount) {
    return ((blendColor * amount) + (1-amount) * baseColor);
  }

  /**
   * Colors based on the Electronic color codes and corosponding RAL colors
   *
   * @see https://en.wikipedia.org/wiki/Electronic_color_code#Color_band_system
   * @see https://www.ralcolorchart.com/
   *
   * @param color The Inputcolor as string
   *
   * @returns array | undefined
   */
  getColorAsArray(color) {
    switch(color) {
      case 'black':
        return [14, 14, 16];
      case 'white':
        return [227, 217, 198];
      case 'red':
        return [167, 41, 32];
      case 'yellow':
        return [246, 182, 0];
      case 'green':
        return [97, 153, 59];
      case 'blue':
        return [0, 124, 176];
    }
    return undefined;
  }

  analyze(tiles) {
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];
      // UP
      if (compareEdge(tile.edges[2], this.edges[0])) {
        this.up.push(i);
      }
      // RIGHT
      if (compareEdge(tile.edges[3], this.edges[1])) {
        this.right.push(i);
      }
      // DOWN
      if (compareEdge(tile.edges[0], this.edges[2])) {
        this.down.push(i);
      }
      // LEFT
      if (compareEdge(tile.edges[1], this.edges[3])) {
        this.left.push(i);
      }
    }
  }

  rotate(num) {
    const w = this.img.width;
    const h = this.img.height;
    const newImg = createGraphics(w, h);
    newImg.imageMode(CENTER);
    newImg.translate(w / 2, h / 2);
    newImg.rotate(HALF_PI * num);
    newImg.image(this.img, 0, 0);

    const newEdges = [];
    const len = this.edges.length;
    for (let i = 0; i < len; i++) {
      newEdges[i] = this.edges[(i - num + len) % len];
    }
    return new Tile(newImg, newEdges);
  }
}
