export class DynamicBitSet implements Iterable<number> {
  bits: Uint8Array;

  constructor() {
    this.bits = new Uint8Array(1);
  }

  #position(pos: number): [index: number, bit: number] {
    return [pos >> 3, pos % 8];
  }

  #ensureSize(pos: number) {
    const [index] = this.#position(pos);
    if (index >= this.bits.length) {
      const newBits = new Uint8Array(index + 1);
      newBits.set(this.bits);
      this.bits = newBits;
    }
  }

  delete(pos: number) {
    this.#ensureSize(pos);
    const [index, bit] = this.#position(pos);
    this.bits[index] &= ~(1 << bit);
    return this;
  }

  toggle(pos: number) {
    this.#ensureSize(pos);
    const [index, bit] = this.#position(pos);
    this.bits[index] ^= 1 << bit;
    return this;
  }

  add(...numbers: number[]) {
    for (const pos of numbers) {
      this.#ensureSize(pos);
      const [index, bit] = this.#position(pos);
      this.bits[index] |= 1 << bit;
    }
    return this;
  }

  has(pos: number): boolean {
    const [index, bit] = this.#position(pos);
    return index < this.bits.length && ((this.bits[index] >> bit) & 1) === 1;
  }

  *[Symbol.iterator]() {
    const size = 8;
    for (let i = 0; i < this.bits.length; i++) {
      const block = this.bits[i];
      if (block === 0) continue;
      for (let j = 0; j < size; j++) {
        if ((block & (1 << j)) !== 0) {
          yield i * size + j;
        }
      }
    }
  }
}
