import { DynamicBitSet } from "./dynamic-bitset.ts";

type Callback<T, U> = (value: T, index: number, instance: Range) => U;
class Range implements Iterable<number> {
  public readonly end: number;
  constructor(
    public readonly start: number,
    end?: number,
    public readonly steps = 1
  ) {
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

  map<U>(callback: Callback<number, U>) {
    const returned: U[] = [];
    for (const [index, value] of this.entries()) {
      returned.push(callback(value, index, this));
    }
    return returned;
  }

  forEach(callback: Callback<number, void>) {
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
    return new Range(
      this.end - this.steps,
      this.start - Math.sign(this.steps),
      -this.steps
    );
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
    const sets = new DynamicBitSet();
    let i = 0;
    while (i < length) {
      if (sets.has(i)) {
        continue;
      }
      sets.add(i);
      yield this.at(Math.floor(Math.random() * this.length));
      i++;
    }
  }
}

export function range(start: number, end?: number, steps?: number) {
  return new Range(start, end, steps);
}
