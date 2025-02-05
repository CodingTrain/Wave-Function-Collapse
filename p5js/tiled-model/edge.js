let edges = []

// Greatly reduce the input image size so that edge can
// be matched fuzzily.
let edge_size = 8

// Reset known edges pool
function reset_edges() {
  edges = []
}

function set_edge_size(images) {
  widths = images.map(function(img) {
    return img.width
  })
  // console.log(`image widths: ${widths}`)
  max_width = max(widths)
  if (max_width <= 3) {
    edge_size = max_width
  }
  else {
    edge_size = max(4, min(8, int(floor(max_width / 16))))
  }
  // console.log(`edge size: ${edge_size}`)
}

// Track image edges and give unique edges unique IDs
class Edge {
    constructor(img, side, filter) {
      // Top
      if (side == 0) {
        this.img = createImage(edge_size, 1)
        this.img.copy(img,
          0, 0, img.width, 1,
          0, 0, edge_size, 1)
      }
      // Right
      if (side == 1) {
        this.img = createImage(1, edge_size)
        this.img.copy(img,
          img.width - 1, 0, 1, img.height,
          0, 0,             1, edge_size)
      }
      // Bottom
      if (side == 2) {
        this.img = createImage(edge_size, 1)
        this.img.copy(img,
          0, img.height - 1, img.width, 1,
          0, 0,              edge_size, 1)
      }
      // Left
      if (side == 3) {
        this.img = createImage(1, edge_size)
        this.img.copy(img,
          0, 0, 1, img.height,
          0, 0, 1, edge_size)
      }

      if (filter != undefined) {
        this.img.loadPixels()
        filter(this.img)
        this.img.updatePixels()
      }

      for (let i = 0; i < edges.length; i++) {
        if (this._match(edges[i])) {
            this.id = edges[i].id
            return
        }
      }

      this.id = edges.length;
      edges.push(this)
    }
  
    _match(edge) {
      this.img.loadPixels()
      edge.img.loadPixels()

      // Allow some small differences in RGB colors to allow
      // small mis-match
      let range = min(1, int(floor(edge_size / 4)))
      let max_diff = edge_size * 2
      let diff_r = 0
      let diff_g = 0
      let diff_b = 0
      
      for (let x1 = 0; x1 < edge_size; x1++) {
        let r1 = this.img.pixels[x1 * 4 + 0]
        let g1 = this.img.pixels[x1 * 4 + 1]
        let b1 = this.img.pixels[x1 * 4 + 2]
        let best_r = 100
        let best_g = 100
        let best_b = 100
        for (let offset = -range; offset <= range; ++offset) {
          let x2 = x1 + offset
          if (x2 < 0)
            continue
          if (x2 >= edge_size)
            continue
          let r2 = edge.img.pixels[x2 * 4 + 0]
          let g2 = edge.img.pixels[x2 * 4 + 1]
          let b2 = edge.img.pixels[x2 * 4 + 2]

          let dr = abs(r1 - r2)
          let dg = abs(g1 - g2)
          let db = abs(b1 - b2)

          if (dr < best_r)
            best_r = dr
          if (dg < best_g)
            best_g = dg
          if (db < best_b)
            best_b = db
        }
        diff_r += best_r
        diff_g += best_g
        diff_b += best_b
      }
      //console.log(`diff rgb: ${diff_r} ${diff_g} ${diff_b}`)
      if (diff_r > max_diff || diff_g > max_diff || diff_b > max_diff) {
        return false
      }
      return true
    }
  }
  