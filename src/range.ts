type Callback<T, U> = (value: T, index: number, instance: Range) => U;
class Range {
  public readonly end: number;
  constructor(
    public readonly start: number,
    end?: number,
    public readonly steps = 1
  ) {
    if (!end) {
      this.end = start;
      this.start = 0;
    } else {
      this.end = end;
    }
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

  *[Symbol.iterator]() {
    let start = this.start;
    while (Math.abs(start - this.end) > 0) {
      yield start;
      start += this.steps;
    }
  }
}

export function range(start: number, end?: number, steps?: number) {
  return new Range(start, end, steps);
}
