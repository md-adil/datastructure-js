import { BitSet } from "./bitset.ts";
import { IterCallback } from "./types.ts";

type Callback<R> = IterCallback<number, R, Range>;

class Range implements Iterable<number> {
  public end: number;
  constructor(public start: number, end?: number, public steps = 1) {
    if (end === undefined) {
      this.end = start;
      this.start = 0;
    } else {
      this.end = end;
    }
    if (steps === 0) {
      throw new Error("Step cannot be zero");
    }
    if (
      (this.start < this.end && steps < 0) ||
      (this.start > this.end && steps > 0)
    ) {
      throw new Error("Step direction incompatible with range direction");
    }
  }

  valueOf() {
    return this.length;
  }

  get length(): number {
    return Math.max(
      0,
      Math.ceil(Math.abs(this.end - this.start) / Math.abs(this.steps))
    );
  }

  at(index: number): number | undefined {
    const len = this.length;
    if (index < 0 || index >= len) return undefined;
    return this.start + index * this.steps;
  }

  map<U>(callback: Callback<U>) {
    const returned: U[] = [];
    for (const [index, value] of this.entries()) {
      returned.push(callback(value, index, this));
    }
    return returned;
  }

  *filter(callback: Callback<unknown>) {
    for (const [index, value] of this.entries()) {
      if (callback(value, index, this)) {
        yield value;
      }
    }
  }

  reduce<U>(
    callback: (acc: U, value: number, index: number, range: Range) => U,
    initial: U
  ): U {
    let acc = initial;
    for (const [index, value] of this.entries()) {
      acc = callback(acc, value, index, this);
    }
    return acc;
  }

  forEach(callback: Callback<void>) {
    for (const [index, value] of this.entries()) {
      callback(value, index, this);
    }
  }

  *entries() {
    let index = 0;
    for (const value of this) {
      yield [index, value];
      index++;
    }
  }

  reverse() {
    if (this.end === Infinity) {
      throw new RangeError("Can't start with Infinity");
    }
    const start = this.start + this.steps * (this.length - 1);
    const end = this.start - Math.sign(this.steps);
    this.start = start;
    this.end = end;
    this.steps = -this.steps;
    return this;
  }

  toReversed() {
    return new Range(this.start, this.end, this.steps).reverse();
  }

  *[Symbol.iterator]() {
    let start = this.start;
    const steps = this.steps;
    const end = this.end;

    while (steps > 0 ? start < end : start > end) {
      yield start;
      start += this.steps;
    }
  }

  *shuffle() {
    const length = this.length;
    if (length === Infinity)
      throw new Error("Can not shuffle infinity numbers");
    const sets = new BitSet(length);
    let i = 0;
    while (i < length) {
      const index = Math.floor(Math.random() * length);
      if (sets.has(index)) {
        continue;
      }
      sets.add(index);
      yield this.at(index)!;
      i++;
    }
  }
}

export function range(start: number, end?: number, steps?: number) {
  return new Range(start, end, steps);
}
