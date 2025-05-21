import { BitSet } from "./bitset.ts";

export class DynamicBitSet extends BitSet {
  constructor() {
    super(8);
  }

  protected override position(pos: number): [index: number, bit: number] {
    const index = pos >> 3;
    if (index >= this.bits.length) {
      this.resize(index + 1);
    }
    return [pos >> 3, pos % 8];
  }
}
