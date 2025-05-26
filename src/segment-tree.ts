export class SegmentTree<T> {
  private readonly tree: T[];
  private readonly n: number;

  constructor(
    private readonly data: T[],
    private readonly merge: (a: T, b: T) => T,
    private readonly defaultValue: T
  ) {
    this.n = data.length;
    this.tree = new Array(4 * this.n).fill(this.defaultValue);
    this.build(0, 0, this.n - 1);
  }

  private build(node: number, l: number, r: number) {
    if (l === r) {
      this.tree[node] = this.data[l];
    } else {
      const mid = Math.floor((l + r) / 2);
      this.build(2 * node + 1, l, mid);
      this.build(2 * node + 2, mid + 1, r);
      this.tree[node] = this.merge(
        this.tree[2 * node + 1],
        this.tree[2 * node + 2]
      );
    }
  }

  update(index: number, value: T) {
    this._update(0, 0, this.n - 1, index, value);
  }

  private _update(node: number, l: number, r: number, index: number, value: T) {
    if (l === r) {
      this.tree[node] = value;
    } else {
      const mid = Math.floor((l + r) / 2);
      if (index <= mid) {
        this._update(2 * node + 1, l, mid, index, value);
      } else {
        this._update(2 * node + 2, mid + 1, r, index, value);
      }
      this.tree[node] = this.merge(
        this.tree[2 * node + 1],
        this.tree[2 * node + 2]
      );
    }
  }

  query(left: number, right: number): T {
    return this._query(0, 0, this.n - 1, left, right);
  }

  private _query(
    node: number,
    l: number,
    r: number,
    left: number,
    right: number
  ): T {
    if (r < left || l > right) return this.defaultValue;
    if (left <= l && r <= right) return this.tree[node];

    const mid = Math.floor((l + r) / 2);
    const leftVal = this._query(2 * node + 1, l, mid, left, right);
    const rightVal = this._query(2 * node + 2, mid + 1, r, left, right);
    return this.merge(leftVal, rightVal);
  }

  toArray(): T[] {
    return this.tree;
  }
}
