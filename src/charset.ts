import { BitSet } from "./bitset.ts";
import { isIterable, toIterable, mapIterable, MapFn } from "./iterable.ts";

export class CharSet {
  static from(
    iterable: ArrayLike<string> | Iterable<string> | CharSet,
    mapFn?: MapFn<string, string>
  ) {
    if (iterable instanceof CharSet && !mapFn) {
      return new CharSet(BitSet.from(iterable.bitSet));
    }
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

  private readonly bitSet: BitSet;

  constructor(size: number | BitSet = 128) {
    if (size instanceof BitSet) {
      this.bitSet = size;
    } else {
      if (size % 32 !== 0) throw new Error("Size must be multiple of 32");
      this.bitSet = new BitSet(size);
    }
  }

  private index(char: string) {
    return char.charCodeAt(0);
  }

  add(char: string) {
    this.bitSet.add(this.index(char));
  }

  has(char: string) {
    return this.bitSet.has(this.index(char));
  }

  delete(char: string) {
    this.bitSet.delete(this.index(char));
    return this;
  }

  clear() {
    this.bitSet.clear();
  }

  union(...sets: CharSet[]) {
    return new CharSet(this.bitSet.union(...sets.map((x) => x.bitSet)));
  }

  difference(other: CharSet) {
    return new CharSet(this.bitSet.difference(other.bitSet));
  }

  intersection(charSet: CharSet) {
    return new CharSet(this.bitSet.intersection(charSet.bitSet));
  }

  *entries() {
    for (const value of this.values()) {
      yield [value, value];
    }
  }

  *values() {
    for (const index of this.bitSet) {
      yield String.fromCharCode(index);
    }
  }

  *[Symbol.iterator](): IterableIterator<string> {
    yield* this.values();
  }
}

export function charset(...chars: string[]) {
  const set = new CharSet();
  return set.union(...chars.map((x) => CharSet.from(x)));
}
