import { BitSet } from "./bitset.ts";

export class DynamicBitSet extends BitSet {
  constructor() {
    super(8);
  }

  protected override position(pos: number): [index: number, bit: number] {
    const [index, bit] = super.position(pos);
    if (index >= this.bits.length) {
      this.capacity =
        (index + 1) * this.bits.BYTES_PER_ELEMENT * this.bits.byteLength;
    }
    return [index, bit];
  }
}
