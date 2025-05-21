import { isIterable, toIterable, mapIterable, MapFn } from "./iterable.ts";

export class CharSet {
  private bits: Uint32Array;

  static from(iterable: ArrayLike<string> | Iterable<string>, mapFn?: MapFn<string, string>) {
    if (!isIterable(iterable)) {
      iterable = toIterable(iterable);
    }
    if (mapFn) {
      iterable = mapIterable(iterable, mapFn);
    }
    const set = new CharSet();
    for (const char of iterable) {
      set.add(char);
    }
    return set;
  }

  constructor(size = 128) {
    if (size % 32 !== 0) throw new Error("Size must be multiple of 32");
    this.bits = new Uint32Array(size / 32);
  }

  private index(char: string) {
    const code = char.charCodeAt(0);
    if (code >= this.bits.length * 32) throw new Error("Char out of bounds");
    return [code >>> 5, code & 31]; // [index, bit]
  }

  add(char: string) {
    const [i, bit] = this.index(char);
    this.bits[i] |= 1 << bit;
  }

  has(char: string) {
    const [i, bit] = this.index(char);
    return (this.bits[i] & (1 << bit)) !== 0;
  }

  delete(char: string) {
    const [i, bit] = this.index(char);
    this.bits[i] &= ~(1 << bit);
  }

  clear() {
    this.bits.fill(0);
  }

  union(...sets: CharSet[]) {
    const newSet = CharSet.from(this);
    for (const set of sets) {
      for (const value of set) {
        newSet.add(value);
      }
    }
    return newSet;
  }
  *entries() {
    for (const value of this) {
      yield [value, value];
    }
  }

  *[Symbol.iterator](): IterableIterator<string> {
    for (let i = 0; i < this.bits.length; i++) {
      const block = this.bits[i];
      if (block === 0) continue;
      for (let j = 0; j < 32; j++) {
        if ((block & (1 << j)) !== 0) {
          yield String.fromCharCode(i * 32 + j);
        }
      }
    }
  }
}

export function charset(...chars: string[]) {
  const set = new CharSet();
  return set.union(...chars.map((x) => CharSet.from(x)));
}
