///<reference path="./index.d.ts"/>

/**
 * @typedef {{
 *    initializer?:()=>Cell
 * }} TileGridOptions
 */


class TileGrid {

    /**
     * @type {number}
     */
    dimensions

    /**
     * @type {Array<Cell>}
     */
    grid = []


    /**
     * 
     * @param {number} dimensions 
     * @param {TileGridOptions} [options]
     */
    constructor(dimensions, options) {
        this.dimensions = dimensions
        this.options = options


        const initializer = this.options.initializer
        if(initializer) {
            this.forEachPosition(pos => {
                this.grid[this.vectorToIndex(pos)] = initializer(pos)
            })
        }
    }

    getMapSize() {
        return createVector(this.dimensions, this.dimensions)
    }
    /**
     * 
     * @param {import("p5").Vector} position 
     */
    getCellForPosition(position) {
        return this.grid[this.vectorToIndex(position)];
    }

    /**
     * 
     * @param {((pos: import("p5").Vector) => void)} cb 
     */
    forEachPosition(cb) {
        for(let y = 0; y < this.getMapSize().x; y++) {
            for(let x = 0; x < this.getMapSize().y; x++) {
                cb(createVector(y, x));
            }
        }
    }
    /**
    * @param { import("p5").Vector} position
    * @param {((pos: import("p5").Vector,directionString:"up"|"down"|"left"|"right") => void)} cb 
    */
    forEachDirection(position, cb) {
        const directions = [
            [this.up(position), "up"],
            [this.down(position), "down"],
            [this.left(position), "left"],
            [this.right(position), "right"]]
        for(const direction of directions) {
            if(direction !== null) {
                cb(direction[0], direction[1]);
            }
        }
    }
    /**
     * @param {import("p5").Vector} vector
     */
    vectorToIndex(vector) {
        return vector.y * this.getMapSize().x + vector.x
    }

    /**
     * 
     * @param {import("p5").Vector} vector 
     */
    validPosition(vector) {
        return vector.x >= 0 && vector.y >= 0
            && vector.x <= this.getMapSize().x && vector.y <= this.getMapSize().y
            && vector.x % 1 === 0 && vector.y % 1 === 0
    }

    /**
     * @param {import("p5").Vector} vector 
     * @param {number} [increments] 
     */
    up(vector, increments = 1) {
        const newVector = vector.add(0, -1 * increments)
        if(!this.validPosition(newVector)) {
            return null;
        }
        return newVector
    }
    /**
    * @param {import("p5").Vector} vector 
    * @param {number} [increments] 
    */
    down(vector, increments = 1) {
        const newVector = vector.add(0, 1 * increments)
        if(!this.validPosition(newVector)) {
            return null;
        }
        return newVector
    }
    /**
    * @param {import("p5").Vector} vector 
    * @param {number} [increments] 
    */
    right(vector, increments = 1) {
        const newVector = vector.add(1 * increments, 0)
        if(!this.validPosition(newVector)) {
            return null;
        }
        return newVector
    }
    /**
    * @param {import("p5").Vector} vector 
    * @param {number} [increments] 
    */
    left(vector, increments = 1) {
        const newVector = vector.add(-1 * increments, 0)
        if(!this.validPosition(newVector)) {
            return null;
        }
        return newVector
    }
} 