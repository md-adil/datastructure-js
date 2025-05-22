import { BitSet } from "./bitset.ts";

export class DynamicBitSet extends BitSet {
  constructor() {
    super(8);
  }

  protected override position(pos: number): [index: number, bit: number] {
    const [index, bit] = super.position(pos);
    if (index >= this.bits.length) {
      this.resize(index + 1);
    }
    return [index, bit];
  }
}
