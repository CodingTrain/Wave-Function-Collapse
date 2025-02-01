class BitmapIteratorResult {
  constructor(item) {
    this.done = (item == undefined)
    this.value = item
  }
}

class BitmapIterator {
  constructor(bm) {
    this.bitmap = bm
    this.index = -1
  }

  next() {
    while (true) {
      this.index += 1
      if (this.index >= this.bitmap.bits.length * 32) {
        return new BitmapIteratorResult()
      }
      if (this.bitmap.has(this.index)) {
        return new BitmapIteratorResult(this.index)
      }
    }
  }

  [Symbol.iterator]() {
    return this
  }
}

class Bitmap {
  constructor(items) {
    this.bits = [0]
    if (items != undefined) {
      for (let item of items)
        this.add(item)
    }
  }

  [Symbol.iterator]() {
    return new BitmapIterator(this)
  }

  size() {
    let count = 0
    for (let i = 0; i < this.bits.length * 32; ++i)
      if (this.has(i))
        count++
    return count
  }

  extend(newLength) {
    const start = this.bits.length
    this.bits.length = newLength
    this.bits.fill(0, start)
  }

  truncate(newLength) {
    this.bits.length = newLength
  }

  fill(itemCount) {
    for (let i = itemCount - 1; i >= 0; --i)
      this.add(i)
  }

  clear() {
    this.bits.fill(0, 0)
  }

  has(item) {
    return (((this.bits[(item / 32 | 0)]) & (1 << (item % 32))) != 0)
  }

  add(item) {
    const pos = (item / 32) | 0
    if (pos >= this.bits.length)
      this.extend(pos+1)
    this.bits[pos] = this.bits[pos] | (1 << (item % 32))
  }

  delete(item) {
    const pos = (item / 32) | 0
    if (pos >= this.bits.length)
      return
    this.bits[pos] = this.bits[pos] & ~(1 << item % 32)
  }

  in_place_union(other) {
    if (other.bits.length > this.bits.length)
      this.extend(other.bits.length)
    for (let i = 0; i < other.bits.length; ++i)
      this.bits[i] |= other.bits[i]
  }


  in_place_intersection(other) {
    if (other.bits.length < this.bits.length)
      this.truncate(other.bits.length)
    for (let i = 0; i < other.bits.length; ++i)
      this.bits[i] &= other.bits[i]
  }

  first_value() {
    for (let i = 0; i < this.bits.length; ++i) {
      if (this.bits[i] != 0) {
        i *= 32
        while (true) {
          if (this.has(i))
            return i
          i++
        }
      }
    }
    return -1
  }

  to_array() {
    let arr = []
    for (let i = 0; i < this.bits.length * 32; ++i) {
      if (this.has(i))
        arr.push(i)
    }
    return arr
  }
}