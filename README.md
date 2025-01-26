# Wave-Function-Collapse

Straight out of quantum mechanics, **Wave Function Collapse** (WFC) is an algorithm for procedural generation of images. This repository features **two approaches** to the WFC: the **Tiled Model** (Coding Challenge 171) and the **Overlapping Model** (Coding Challenge #186). Both implementations are available in JavaScript (p5.js) and ported to Processing (Java).

<img src="gifs/wfc_tiled.gif" alt="GIF animation of the tiled WFC algorithm" height="250"> <img src="gifs/wfc_overlapping.gif" alt="GIF animation of the overlapping WFC algorithm" height="250">

## Coding Challenges

- [Coding Challenge #171: Wave Function Collapse](https://thecodingtrain.com/challenges/171-wave-function-collapse)
- [Coding Challenge #186: WFC Overlapping Model](https://thecodingtrain.com/challenges/186-wfc-overlapping-model)

## Archived Raw Footage

- 🔴 [Wave Function Collapse Tiled Model Live Stream #1](https://youtu.be/6Vag7NJUjJo)
- 🔴 [Wave Function Collapse Tiled Model Live Stream #2](https://youtu.be/FGmB5ZHhhiA)
- 🔴 [Wave Function Collapse Tiled Model Live Stream #3](https://youtu.be/QvoTSl60Y88)
- 🔴 [Wave Function Collapse Overlapping Model Live Stream #1](https://youtube.com/live/gwFBEUwjcGE)
- 🔴 [Wave Function Collapse Overlapping Model Live Stream #2](https://youtube.com/live/JJX_yaenzCs)

## Overview

Wave Function Collapse is a constraint-satisfaction algorithm inspired by quantum mechanics. At a high level, you have:

1. **Tiles** (or “patterns”) that can appear in each cell.
2. **Adjacency rules** describing which tiles can appear next to each other.
3. **Entropy** that helps decide which cell to collapse (choose a tile for) next.
4. **Propagation** to eliminate invalid tiles from neighbors as constraints tighten.

### Completed

- [x] Implementation of Tile Model (Challenge 171)
- [x] Implementation of Overlapping Model (Challenge 186)
- [x] Processing (Java) ports for both models

### Corrections / Additional Features

- [ ] Additional edge cases for tiles 4 and 5 (Tiled Model).
- [ ] Computed Property Names (Tiled Model) [Issue #35](https://github.com/CodingTrain/Wave-Function-Collapse/issues/35)
- [ ] Backtracking for conflict resolution.

## Community Contributions and Improvements

- [TileGrid Helper Class](https://github.com/jonnytest1/Wave-Function-Collapse/tree/main) by [@jonnytest1](https://github.com/jonnytest1) A generic grid layout approach using p5.js vectors, making it easier to unify directional logic and reference valid neighboring positions.


## Key Resources

- [Wave Function Collapse algorithm source](https://github.com/mxgmn/WaveFunctionCollapse)
- [Wave Function Collapse Processing forum discussion](https://discourse.processing.org/t/wave-collapse-function-algorithm-in-processing/12983)
- [Gridbugs Procedural Generation with Wave Function Collapse](https://www.gridbugs.org/wave-function-collapse/)
- [Model Synthesis by Paul Merrell](https://paulmerrell.org/model-synthesis/)
- [WFC using local storage by @kfahn22](https://editor.p5js.org/kfahn/full/iNUF-Lgdf)
