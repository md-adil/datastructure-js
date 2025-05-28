import { isIterable, MapFn, mapIterable, toIterable } from "./iterable.ts";
import { IterCallback, UintArray } from "./types.ts";

export class BitSet implements Iterable<number> {
  static from(iterable: ArrayLike<number> | Iterable<number> | BitSet, mapFn?: MapFn<number, number>) {
    if (iterable instanceof BitSet && !mapFn) {
      const newSet = new BitSet(iterable.capacity);
      newSet.bucket.set(iterable.bucket);
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

  bucket: UintArray;
  #bitLength;
  #capacity: number;

  constructor(capacity: number | UintArray = 64) {
    const [bits, size, cap] = this.#createBucket(capacity);
    this.bucket = bits;
    this.#bitLength = size;
    this.#capacity = cap;
  }

  get capacity(): number {
    return this.#capacity;
  }

  set capacity(capacity: number | UintArray) {
    const [bits, size, cap] = this.#createBucket(capacity);
    bits.set(this.bucket);
    this.#bitLength = size;
    this.#capacity = cap;
    this.bucket = bits;
  }

  get bitLength() {
    return this.#bitLength;
  }

  #createBucket(capacity: number | UintArray): [bucket: UintArray, size: number, capacity: number] {
    if (typeof capacity === "number") {
      return [new Uint32Array(Math.ceil(capacity / 32)), 32, capacity];
    }
    return [capacity, capacity.BYTES_PER_ELEMENT * 8, capacity.byteLength * 8];
  }

  protected position(pos: number): [index: number, bit: number] {
    if (pos >= this.#capacity) {
      throw new RangeError("Index exceeds BitSet capacity");
    }
    return [Math.floor(pos / this.#bitLength), pos % this.#bitLength];
  }

  clear() {
    this.bucket.fill(0);
    return this;
  }

  *filter(callback: IterCallback<number, unknown, BitSet>) {
    let index = 0;
    for (const value of this) {
      if (!callback(value, index, this)) continue;
      yield value;
      index++;
    }
  }

  *keys() {
    yield* this.values();
  }

  *values(): Generator<number> {
    const size = this.#bitLength;
    for (let i = 0; i < this.bucket.length; i++) {
      const block = this.bucket[i];
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
    this.bucket[index] &= ~(1 << bit);
    return this;
  }

  toggle(pos: number) {
    const [index, bit] = this.position(pos);
    this.bucket[index] ^= 1 << bit;
    return this;
  }

  add(...numbers: number[]) {
    for (const pos of numbers) {
      const [index, bit] = this.position(pos);
      this.bucket[index] |= 1 << bit;
    }
    return this;
  }

  has(pos: number) {
    const [index, bit] = this.position(pos);
    return Boolean((this.bucket[index] >> bit) & 1);
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
