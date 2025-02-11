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
    constructor(img, side, edge_depth, filter) {
      this.edge_depth = edge_depth

      smooth()

      // Top
      if (side == 0) {
        this.img = createImage(edge_size, edge_depth)
        this.img.copy(img,
          0, 0, img.width, edge_depth,
          0, 0, edge_size, edge_depth)
      }

      // Right
      if (side == 1) {
        this.img = createImage(edge_depth, edge_size)
        this.img.copy(img,
          img.width - edge_depth, 0, edge_depth, img.height,
          0,                      0, edge_depth, edge_size)
      }

      // Bottom
      if (side == 2) {
        this.img = createImage(edge_size, edge_depth)
        this.img.copy(img,
          0, img.height - edge_depth, img.width, edge_depth,
          0, 0,                       edge_size, edge_depth)
      }

      // Left
      if (side == 3) {
        this.img = createImage(edge_depth, edge_size)
        this.img.copy(img,
          0, 0, edge_depth, img.height,
          0, 0, edge_depth, edge_size)
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
  
    // _copy(img, sx, sy) {
    //   img.loadPixels()
    //   this.img.loadPixels()
    //   const x_ratio = img.width / edge_size
    //   const y_ratio = img.height / edge_size
    //   console.log(`ratio x/y: ${x_ratio}/${y_ratio}`)
    //   for (let x = 0; x < this.img.width; ++x) {
    //     for (let y = 0; y < this.img.height; ++y) {
    //       let count = 0
    //       let r = 0.
    //       let g = 0.
    //       let b = 0.
    //       for (let dx = 0; dx < x_ratio; ++dx ) {
    //         for (let dy = 0; dy < y_ratio; ++dy ) {
    //           let px = sx + x * x_ratio + dx
    //           let py = sy + y * y_ratio + dy
    //           let pi = (py * img.width + px) * 4
    //           if (pi >= img.pixels.length)
    //             continue
    //           r += img.pixels[pi + 0]
    //           g += img.pixels[pi + 1]
    //           b += img.pixels[pi + 2]
    //           count++
    //         }
    //       }
    //       let sr = (r / count) | 0
    //       let sg = (g / count) | 0
    //       let sb = (b / count) | 0
    //       this.img.pixels[(y * this.img.width + x) * 4 + 0] = sr
    //       this.img.pixels[(y * this.img.width + x) * 4 + 1] = sg
    //       this.img.pixels[(y * this.img.width + x) * 4 + 2] = sb
    //       console.log(`${count}: ${r}/${g}/${b} = ${sr}/${sg}/${sb}`)
    //     }
    //   }
    //   this.img.updatePixels()
    // }

    _match(edge) {
      this.img.loadPixels()
      edge.img.loadPixels()

      // Allow some small differences in RGB colors to allow
      // small mis-match
      const range = min(1, int(floor(edge_size / 4)))
      const max_diff = edge_size * 2
      let diff_r = 0
      let diff_g = 0
      let diff_b = 0

      for (let y = 0; y < this.edge_depth; ++y) {
        const depth_offset = y * edge_size * 4;
        for (let x1 = 0; x1 < edge_size; x1++) {
          const r1 = this.img.pixels[x1 * 4 + 0 + depth_offset]
          const g1 = this.img.pixels[x1 * 4 + 1 + depth_offset]
          const b1 = this.img.pixels[x1 * 4 + 2 + depth_offset]
          let best_r = 100
          let best_g = 100
          let best_b = 100
          for (let offset = -range; offset <= range; ++offset) {
            let x2 = x1 + offset
            if (x2 < 0)
              continue
            if (x2 >= edge_size)
              continue
            const r2 = edge.img.pixels[x2 * 4 + 0 + depth_offset]
            const g2 = edge.img.pixels[x2 * 4 + 1 + depth_offset]
            const b2 = edge.img.pixels[x2 * 4 + 2 + depth_offset]

            const dr = abs(r1 - r2)
            const dg = abs(g1 - g2)
            const db = abs(b1 - b2)

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
      }
      return true
    }
  }
  