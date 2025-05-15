export class BitSet implements Iterable<number> {
  bits: Uint32Array;
  constructor(size = 64) {
    this.bits = new Uint32Array(Math.ceil(size / 32));
  }

  delete(pos: number) {
    const word = Math.floor(pos / 32);
    const bit = pos % 32;
    this.bits[word] &= ~(1 << bit);
    return this;
  }

  toggle(pos: number) {
    const word = Math.floor(pos / 32);
    const bit = pos % 32;
    this.bits[word] ^= 1 << bit;
    return this;
  }

  add(...numbers: number[]) {
    for (const pos of numbers) {
      const word = Math.floor(pos / 32);
      const bit = pos % 32;
      this.bits[word] |= 1 << bit;
      return this;
    }
  }

  has(pos: number) {
    const word = Math.floor(pos / 32);
    const bit = pos % 32;
    return ((this.bits[word] >> bit) & 1) === 1;
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this.bits.length; i++) {
      const block = this.bits[i];
      if (block === 0) continue;
      for (let j = 0; j < 32; j++) {
        if ((block & (1 << j)) !== 0) {
          yield i * 32 + j;
        }
      }
    }
  }
}

export function bitset(...values: number[]) {
  const bs = new BitSet();
  values.forEach((x) => bs.add(x));
  return bs;
}
