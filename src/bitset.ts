import { isIterable, MapFn, mapIterable, toIterable } from "./iterable.ts";
import { IterCallback } from "./types.ts";

export class BitSet implements Iterable<number> {
  static from(
    iterable: ArrayLike<number> | Iterable<number> | BitSet,
    mapFn?: MapFn<number, number>
  ) {
    if (iterable instanceof BitSet && !mapFn) {
      const newSet = new BitSet(iterable.capacity);
      newSet.bits.set(iterable.bits);
      return newSet;
    }
    if (!isIterable(iterable)) {
      iterable = toIterable(iterable);
    }
    if (mapFn) {
      iterable = mapIterable(iterable, mapFn);
    }
    const newSet = new BitSet();
    for (const char of iterable) {
      newSet.add(char);
    }
    return newSet;
  }

  bits: Uint32Array;

  #capacity: number;

  constructor(capacity = 64) {
    this.#capacity = capacity;
    this.bits = new Uint32Array(Math.ceil(capacity / 32));
  }

  get capacity() {
    return this.#capacity;
  }

  set capacity(size: number) {
    const bits = new Uint32Array(Math.ceil(size / 32));
    bits.set(this.bits);
    this.#capacity = size;
    this.bits = bits;
  }

  protected position(pos: number): [index: number, bit: number] {
    if (pos >= this.#capacity) {
      throw new RangeError("Index exceeds BitSet capacity");
    }
    return [pos >> 5, pos % 32];
  }

  clear() {
    this.bits.fill(0);
    return this;
  }

  *keys() {
    yield* this.values();
  }

  *values(): Generator<number> {
    const size = 32;
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
    return Boolean((this.bits[index] >> bit) & 1);
  }

  *entries() {
    for (const value of this.values()) {
      yield [value, value];
    }
  }

  difference(other: BitSet) {
    const newSet = BitSet.from(this);
    for (const value of this) {
      if (other.has(value)) {
        newSet.delete(value);
      }
    }
    return newSet;
  }

  intersection(other: BitSet) {
    const newSet = new BitSet(Math.min(this.capacity, other.capacity));
    for (const value of this) {
      if (other.has(value)) {
        newSet.add(value);
      }
    }
    return newSet;
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
    yield* this.values();
  }
}

export function bitset(...values: number[]) {
  const bs = new BitSet();
  bs.add(...values);
  return bs;
}
