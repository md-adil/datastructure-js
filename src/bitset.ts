import { isIterable, MapFn, mapIterable, toIterable } from "./iterable.ts";
import { IterCallback } from "./types.ts";

export class BitSet implements Iterable<number> {
  static from(iterable: ArrayLike<number> | Iterable<number>, mapFn?: MapFn<number, number>) {
    if (!isIterable(iterable)) {
      iterable = toIterable(iterable);
    }
    if (mapFn) {
      iterable = mapIterable(iterable, mapFn);
    }
    const set = new BitSet();
    for (const char of iterable) {
      set.add(char);
    }
    return set;
  }

  bits: Uint8Array;

  constructor(size = 64) {
    this.bits = new Uint8Array(Math.ceil(size / 8));
  }

  protected position(pos: number): [index: number, bit: number] {
    return [pos >> 3, pos % 8];
  }

  resize(size: number) {
    const bits = new Uint8Array(size);
    bits.set(this.bits);
    this.bits = bits;
  }

  difference() {}

  intersection() {}

  keys() {}

  values() {}

  forEach(iterator: IterCallback<number, void, BitSet>) {
    for (const value of this) {
      iterator(value, value, this);
    }
  }

  delete(pos: number) {
    const [index, bit] = this.position(pos);
    this.bits[index] &= ~(1 << bit);
    return this;
  }

  toggle(pos: number) {
    const [index, bit] = this.position(pos);
    this.bits[index] ^= 1 << bit;
    return this;
  }

  add(...numbers: number[]) {
    for (const pos of numbers) {
      const [index, bit] = this.position(pos);
      this.bits[index] |= 1 << bit;
    }
    return this;
  }

  has(pos: number) {
    const [index, bit] = this.position(pos);
    return (this.bits[index] >> bit) & 1;
  }

  *entries() {
    for (const value of this) {
      yield [value, value];
    }
  }

  union(...sets: BitSet[]) {
    const newSet = BitSet.from(this);
    for (const set of sets) {
      for (const value of set) {
        newSet.add(value);
      }
    }
    return newSet;
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

export function bitset(...values: number[]) {
  const bs = new BitSet();
  bs.add(...values);
  return bs;
}
