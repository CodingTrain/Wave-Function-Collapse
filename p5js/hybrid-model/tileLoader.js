let tileImages = []
let areTilesRotationAllowed = true

function enableTileRotations(enabled) {
  areTilesRotationAllowed = enabled
}

class TileLoader {
  constructor(url, allowRotations) {
    this.url = url
    this.waitingCount = 0
    this.allowRotations = allowRotations
    this.edgeFilter = undefined
  }

  setEdgeFilter(filter) {
    this.edgeFilter = filter
    return this
  }

  load() {
    reset()
    tileImages = []
    this._load()
  }

  _addImage(img, index) {
    tileImages[index] = img
  }

  _loaded(img, index) {
    this._addImage(img, index)

    this.waitingCount -= 1
    if (this.waitingCount == 0) {
      this._prepareTiles()
      start()
    }
  }

  _prepareTiles(notSelves) {
    set_edge_size(tileImages)
  
    // Initialize tiles with images and edges
    for (let i = 0; i < tileImages.length; i++) {
      tiles[i] = new Tile(tileImages[i], false, i);
    }

    // Prevent the specified tiles from matching themselves.
    if (notSelves != undefined) {
      for (let index of notSelves) {
        for (let tile of tiles) {
          if (tile.index == index) {
            tile.notSelf = true
          }
        }
      }
    }
    
    // Generate rotated versions of tiles and remove duplicates
    if (this.allowRotations && areTilesRotationAllowed) {
      const initialTileCount = tiles.length;
      for (let i = 0; i < initialTileCount; i++) {
        for (let j = 1; j < 4; j++) {
          tiles.push(tiles[i].rotate(j));
        }
      }
    }

    // Detect matching edges
    reset_edges()
    for (let i = 0; i < tiles.length; i++) {
      tiles[i].fillEdges(this.edgeFilter)
      // console.log(`Tile ${i} edges: ${tiles[i].edges}`)
    }
    // console.log(edges)
  
    tiles = this._removeDuplicatedTiles(tiles);
    // console.log(`Total rotated tiles: ${tiles.length}`);
  
    // Analyze tiles to generate adjacency rules
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      tile.analyze(tiles);
    }
  }

  _areImagesSimilar(img1, img2) {
    img1.loadPixels()
    img2.loadPixels()

    const maxColorDiff = 2
    const percentSame = 90

    let diffCount = 0

    let count = min(img1.pixels.length, img2.pixels.length)
    for (let i = 0; i < count; ++i) {
      if (abs(img1.pixels[i] - img2.pixels[i]) > maxColorDiff)
        diffCount++
    }

    const maxCount = max(img1.pixels.length, img2.pixels.length)
    diffCount += maxCount - count
    const diffPercent = diffCount * 100. / maxCount

    return (diffPercent <= percentSame)
  }

  _removeDuplicatedTiles(tiles) {
    // Remove duplicated tiles based on its content
    const uniqueTilesMap = new Map()
    for (const tile of tiles) {
      // Try to find an existing similar tile.
      let foundSimilar = false

      // First match the edges to avoid comparing to all tiles.
      const key = tile.edges.join(',')
      if (uniqueTilesMap.has(key)) {
        const existingTiles = uniqueTilesMap.get(key)
        for (let existing of existingTiles) {
          foundSimilar = this._areImagesSimilar(tile.img, existing.img)
          if (foundSimilar) {
            existing.frequency++
            break
          }
        }
      }

      if (!foundSimilar) {
        uniqueTilesMap.set(key, [tile])
      }
    }

    tiles = []
    for (let existingTiles of uniqueTilesMap.values()) {
      for (let tile of existingTiles) {
        tiles.push(tile)
      }
    }

    return tiles
  }
  
  _failed(event) {
    this.waitingCount -= 1
  }
}

class SingleImageTileLoader extends TileLoader {
  constructor(url, tile_size, tile_step) {
    super(url, true)
    this.tile_size = tile_size
    this.tile_step = tile_step
  }

  _load() {
    this.waitingCount += 1
    let self = this
    loadImage(self.url, function (img) { self._loaded(img, 0) }, function (event) { self._failed(event) })
  }

  _addImage(img, index) {
    this._tileImage(img, this.tile_size, this.tile_step)
  }

  _tileImage(img, size, step) {
    for (let x = 0; x <= img.width - size; x += step ) {
      for (let y = 0; y <= img.height - size; y += step ) {
        // console.log(`making image ${x} / ${y}`)
        let tileImg = createImage(size, size)
        tileImg.copy(img, x, y, size, size, 0, 0, size, size)
        tileImages.push(tileImg)
      }
    }
    // console.log(`Made ${tileImages.length} images`)
  }
}

class DirectionalTileLoader extends TileLoader {
  constructor(url) {
    super(url, true)
  }

  _load() {
    this.waitingCount += 5
    let self = this
    loadImage(`${self.url}/blank.png`, function (img) { self._loaded(img, 0) }, function (event) { self._failed(event) })
    loadImage(`${self.url}/down.png`, function (img) { self._loaded(img, 1) }, function (event) { self._failed(event) })
    loadImage(`${self.url}/left.png`, function (img) { self._loaded(img, 2) }, function (event) { self._failed(event) })
    loadImage(`${self.url}/right.png`, function (img) { self._loaded(img, 3) }, function (event) { self._failed(event) })
    loadImage(`${self.url}/up.png`, function (img) { self._loaded(img, 4) }, function (event) { self._failed(event) })
  }
}

class NumberedImagesTileLoader extends TileLoader {
  constructor(url, imageCount, notSelves) {
    super(url, true)
    this.imageCount = imageCount
    this.notSelves = notSelves
  }

  _load() {
    this.waitingCount += this.imageCount
    let self = this
    for (let i = 0; i < this.imageCount; i++) {
      loadImage(`${self.url}${i}.png`, function (img) { self._loaded(img, i) }, function (event) { self._failed(event) })
    }
  }

  _prepareTiles() {
    super._prepareTiles(this.notSelves)
  }
}

function onlyHueFilter(img, minHue, maxHue) {
  px = img.pixels
  for (let i = 0; i < px.length; i += 4) {
    let c = color(px[i], px[i+1], px[i+2], px[i+3])
    let h = hue(c)
    let isHue = (h >= minHue && h <= maxHue)
    if (!isHue) {
      px[i+0] = 0
      px[i+1] = 0
      px[i+2] = 0
      px[i+3] = 0
    }
  }
}

function onlyGreenFilter(img) {
  onlyHueFilter(img, 100, 180)
}

function onlyBlueFilter(img) {
  onlyHueFilter(img, 160, 240)
}

let loaders = new Map([
  ['Polka Dots', new DirectionalTileLoader('../tiled-model/tiles/polka')],
  ['Tracks', new DirectionalTileLoader('../tiled-model/tiles/demo-tracks')],
  ['Mountains', new DirectionalTileLoader('../tiled-model/tiles/mountains').setEdgeFilter(onlyBlueFilter)],
  ['Pipes', (new DirectionalTileLoader('../tiled-model/tiles/pipes')).setEdgeFilter(onlyGreenFilter)],
  ['Roads', new DirectionalTileLoader('../tiled-model/tiles/roads')],

  ['Circuit tiles', new NumberedImagesTileLoader('../tiled-model/tiles/circuit/', 13, [5])],
  ['Coding Train Circuit', new NumberedImagesTileLoader('../tiled-model/tiles/circuit-coding-train/', 13, [5])],
  ['Rail', new NumberedImagesTileLoader('../tiled-model/tiles/rail/tile', 7)],
  ['Polka 2', new NumberedImagesTileLoader('../tiled-model/tiles/polka-2/', 5)],

  ['Flowers', new SingleImageTileLoader('../overlapping-model/images/Flowers.png', 3, 1)],
  ['Angular', new SingleImageTileLoader('../overlapping-model/images/Angular.png', 3, 1)],
  ['City', new SingleImageTileLoader('../overlapping-model/images/city.png', 3, 1)],
  ['Colored City', new SingleImageTileLoader('../overlapping-model/images/ColoredCity.png', 3, 1)],
  ['Disk', new SingleImageTileLoader('../overlapping-model/images/Disk.png', 3, 3)],
  ['Dungeon', new SingleImageTileLoader('../overlapping-model/images/Dungeon.png', 3, 1)],
  ['Knot', new SingleImageTileLoader('../overlapping-model/images/Knot.png', 3, 1)],
  ['Link 2', new SingleImageTileLoader('../overlapping-model/images/Link2.png', 3, 1)],
  ['Magic Office', new SingleImageTileLoader('../overlapping-model/images/MagicOffice.png', 3, 1)],
  ['Maze', new SingleImageTileLoader('../overlapping-model/images/Mazelike.png', 3, 1)],
  ['Office 2', new SingleImageTileLoader('../overlapping-model/images/Office2.png', 3, 1)],
  ['Platformer', new SingleImageTileLoader('../overlapping-model/images/Platformer.png', 3, 1)],
  ['Rooms', new SingleImageTileLoader('../overlapping-model/images/Rooms.png', 3, 1)],
  ['Sewers', new SingleImageTileLoader('../overlapping-model/images/Sewers.png', 3, 1)],
  ['Spirals', new SingleImageTileLoader('../overlapping-model/images/Spirals.png', 3, 1)],
  ['Town', new SingleImageTileLoader('../overlapping-model/images/Town.png', 3, 1)],
  ['Village', new SingleImageTileLoader('../overlapping-model/images/Village.png', 3, 1)],
])
