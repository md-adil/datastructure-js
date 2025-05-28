import { BitSet } from "./bitset.ts";

export class DynamicBitSet extends BitSet {
  constructor() {
    super(8);
  }

  protected override position(pos: number): [index: number, bit: number] {
    const [index, bit] = [Math.floor(pos / this.bitLength), pos % this.bitLength];
    if (index >= this.bucket.length) {
      this.capacity = (index + 1) * this.bitLength;
    }
    return [index, bit];
  }
}
