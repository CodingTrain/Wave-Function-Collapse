class Cell {
  constructor(value) {
    this.collapsed = false;
    this.checked = false;
    if (value instanceof Array) {
      this.options = value;
    } else {
      this.options = [];
      for (let i = 0; i < value; i++) {
        this.options[i] = i;
      }
    }
  }
  entropy() {
    let wt_sum = this.options
      .map((i) => tiles[i].freq)
      .reduce((a, b) => a + b, 0);
    return (
      Math.log2(wt_sum) -
      (1 / wt_sum) *
        this.options
          .map((i) => tiles[i].freq)
          .map((wt) => wt * Math.log2(wt))
          .reduce((a, b) => a + b, 0)
    );
  }
}
