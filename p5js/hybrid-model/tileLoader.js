let tileImages = []
let areTilesRotationsAllowed = false
let areTilesFlipsAllowed = false

function enableTileRotations(enabled) {
  areTilesRotationsAllowed = enabled
}

function enableTileFlips(enabled) {
  areTilesFlipsAllowed = enabled
}

class TileLoader extends MultiStepsAlgo{
  constructor(url, edge_depth) {
    super()
    this.url = url
    this.waitingCount = 0
    this.edge_depth = edge_depth
    this.edgeFilter = undefined
  }

  setEdgeFilter(filter) {
    this.edgeFilter = filter
    return this
  }

  *run() {
    this.restart()
    this._load()
    while (this.waitingCount > 0) {
      yield `Waiting for ${this.waitingCount} images`
      if (this.stopped)
        return
    }

    yield* this._prepareTiles()
    this.finished()
  }

  restart() {
    super.restart()
  }

  finished() {
    super.finished()
    start()
  }

  stop() {
    super.stop()
    this.waitingCount = 0
    reset()
    tileImages = []
  }

  _addImage(img, index) {
    tileImages[index] = img
  }

  _loaded(img, index) {
    this._addImage(img, index)
    this.waitingCount -= 1
  }

  *_prepareTiles(notSelves) {

    set_edge_size(tileImages)
  
    // Initialize tiles with images and edges
    for (let i = 0; i < tileImages.length; i++) {
      yield `Creating tile #${i+1} of ${tileImages.length}`
      if (this.stopped)
        return
      tiles[i] = new Tile(tileImages[i], this.edge_depth, false, i);
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
    
    // Generate flipped versions of tiles
    if (areTilesFlipsAllowed) {
      const initialTileCount = tiles.length;
      for (let i = 0; i < initialTileCount; i++) {
        yield `Flipping tile #${i+1} of ${initialTileCount}`
        if (this.stopped)
          return
        tiles.push(tiles[i].flip());
      }
      // console.log(`Total after flipping tiles: ${tiles.length}`);
    }

    // Generate rotated versions of tiles
    if (areTilesRotationsAllowed) {
      const initialTileCount = tiles.length;
      for (let i = 0; i < initialTileCount; i++) {
        yield `Rotating tile #${i+1} of ${initialTileCount}`
        if (this.stopped)
          return
        for (let j = 1; j < 4; j++) {
          tiles.push(tiles[i].rotate(j));
        }
      }
      // console.log(`Total after rotating tiles: ${tiles.length}`);
    }

    // Detect matching tile edges
    reset_edges()
    for (let i = 0; i < tiles.length; i++) {
      yield `Filling edges of tile #${i+1} of ${tiles.length}`
      if (this.stopped)
        return
      tiles[i].fillEdges(this.edgeFilter)
      // console.log(`Tile ${i} edges: ${tiles[i].edges}`)
    }
    // console.log(edges)
  
    // Remove duplicate tiles
    yield* this._removeDuplicatedTiles(tiles);
    if (this.stopped)
      return
  // console.log(`Total after removing duplicate tiles: ${tiles.length}`);
  
    // Analyze tiles to generate adjacency rules
    for (let i = 0; i < tiles.length; i++) {
      yield `Analyzing tile #${i+1} of ${tiles.length}`
      if (this.stopped)
        return
      const tile = tiles[i];
      tile.analyze(tiles);
    }
    // console.log(`Tiles analysis done`);
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

  *_removeDuplicatedTiles(tiles) {
    // Remove duplicated tiles based on its content
    const uniqueTilesMap = new Map()
    for (const tile of tiles) {
      yield `Removing duplicates of tile #${tile.index+1} of ${tiles.length}`
      if (this.stopped)
        return
      // Try to find an existing similar tile.
      let foundSimilar = false

      // First match the edges to avoid comparing to all tiles.
      const key = tile.edges.join(',')
      if (uniqueTilesMap.has(key)) {
        const existingTiles = uniqueTilesMap.get(key)
        for (let existing of existingTiles) {
          yield `Comparing to tile #${existing.index+1} of ${existingTiles.length}`
          if (this.stopped)
            return
          foundSimilar = this._areImagesSimilar(tile.img, existing.img)
          if (foundSimilar) {
            existing.frequency++
            break
          }
        }
        if (!foundSimilar) {
          existingTiles.push(tile)
        }
      }
      else {
        if (!foundSimilar) {
          uniqueTilesMap.set(key, [tile])
        }
      }
    }

    tiles.length = 0
    for (let existingTiles of uniqueTilesMap.values()) {
      for (let tile of existingTiles) {
        tiles.push(tile)
      }
    }
  }
  
  _failed(event) {
    console.log(`Failed to load image: ${event}`)
    this.waitingCount -= 1
  }
}

class SingleImageTileLoader extends TileLoader {
  constructor(url, tile_size, tile_step, edge_depth) {
    super(url, Math.max(edge_depth, 1))
    this.tile_size = Math.max(tile_size, 1)
    this.tile_step = Math.max(tile_step, 1)
  }

  _load() {
    this.waitingCount += 1
    let self = this
    loadImage(self.url, function (img) { self._loaded(img, 0) }, function (event) { self._failed(event) })
  }

  *_prepareTiles(notSelves) {
    const img = tileImages[0]
    tileImages.length = 0

    const size = this.tile_size
    const step = this.tile_step
    const totalCount = (img.width / step) * (img.height / step)
    let tileIndex = 0

    for (let x = 0; x < img.width; x += step ) {
      for (let y = 0; y < img.height; y += step ) {
        yield `Extracting tile #${++tileIndex} of ${totalCount}`
        if (this.stopped)
          return
        // console.log(`making image ${x} / ${y}`)
        let tileImg = createImage(size, size)
        const missing_x = Math.max(0, x + size - img.width)
        const missing_y = Math.max(0, y + size - img.height)
        tileImg.copy(img,
          x, y,
          size - missing_x, size - missing_y,
          0, 0,
          size - missing_x, size - missing_y)
        if (missing_x > 0)
          tileImg.copy(img,
            0, y,
            missing_x, size,
            size - missing_x, 0,
            missing_x, size)
        if (missing_y > 0)
          tileImg.copy(img,
            x, 0,
            size, missing_y,
            0, size - missing_y,
            size, missing_y)
        if (missing_x > 0 && missing_y > 0)
          tileImg.copy(img,
            0, 0,
            missing_x, missing_y,
            size - missing_x, size - missing_y,
            missing_x, missing_y)
        tileImages.push(tileImg)
      }
    }
    // console.log(`Made ${tileImages.length} images`)

    yield* super._prepareTiles(notSelves)
  }
}

class DirectionalTileLoader extends TileLoader {
  constructor(url) {
    super(url, 1)
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
    super(url, 1)
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

  *_prepareTiles() {
    yield* super._prepareTiles(this.notSelves)
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

  ['Flowers', new SingleImageTileLoader('../overlapping-model/images/Flowers.png', 3, 1, 2)],
  ['Angular', new SingleImageTileLoader('../overlapping-model/images/Angular.png', 3, 1, 2)],
  ['City', new SingleImageTileLoader('../overlapping-model/images/city.png', 3, 1, 2)],
  ['Colored City', new SingleImageTileLoader('../overlapping-model/images/ColoredCity.png', 3, 1, 2)],
  ['Disk', new SingleImageTileLoader('../overlapping-model/images/Disk.png', 3, 3, 1)],
  ['Dungeon', new SingleImageTileLoader('../overlapping-model/images/Dungeon.png', 3, 1, 2)],
  ['Knot', new SingleImageTileLoader('../overlapping-model/images/Knot.png', 3, 1, 2)],
  ['Link 2', new SingleImageTileLoader('../overlapping-model/images/Link2.png', 3, 1, 2)],
  ['Magic Office', new SingleImageTileLoader('../overlapping-model/images/MagicOffice.png', 3, 1, 2)],
  ['Maze', new SingleImageTileLoader('../overlapping-model/images/Mazelike.png', 3, 1, 2)],
  ['Office 2', new SingleImageTileLoader('../overlapping-model/images/Office2.png', 3, 1, 2)],
  ['Platformer', new SingleImageTileLoader('../overlapping-model/images/Platformer.png', 3, 1, 2)],
  ['Rooms', new SingleImageTileLoader('../overlapping-model/images/Rooms.png', 3, 1, 2)],
  ['Sewers', new SingleImageTileLoader('../overlapping-model/images/Sewers.png', 3, 1, 2)],
  ['Spirals', new SingleImageTileLoader('../overlapping-model/images/Spirals.png', 3, 1, 2)],
  ['Town', new SingleImageTileLoader('../overlapping-model/images/Town.png', 3, 1, 2)],
  ['Village', new SingleImageTileLoader('../overlapping-model/images/Village.png', 3, 1, 2)],
])
