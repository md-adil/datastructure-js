import { PriorityQueue } from "./priority-queue.ts";

class Counter<T> implements Iterable<[T, number]> {
  #sets = new Map<T, number>();

  get length() {
    return this.#sets.size;
  }

  constructor(iterable?: Iterable<T>) {
    if (iterable) {
      for (const i of iterable) {
        this.add(i);
      }
    }
  }

  get(c: T, def: number = 0) {
    return this.#sets.get(c) ?? def;
  }

  add(i: T) {
    this.#sets.set(i, this.get(i, 0) + 1);
  }

  entries() {
    return this.#sets;
  }

  elements() {
    return this.#sets.keys();
  }

  leastCommon(n: number) {
    const pq = new PriorityQueue<T>();
    for (const [key, value] of this.#sets) {
      pq.push(value, key);
    }
    const values: [T, number][] = [];
    for (const [key, val] of pq.entries()) {
      if (n < 1) {
        break;
      }
      values.push([val, key]);
      n--;
    }
    return values;
  }

  mostCommon(n: number) {
    const pq = new PriorityQueue<T>();
    for (const [key, value] of this.#sets) {
      pq.push(-value, key);
    }
    const values: [T, number][] = [];
    for (const [key, val] of pq.entries()) {
      if (n < 1) {
        break;
      }
      values.push([val, -key]);
      n--;
    }
    return values;
  }
  subtract() {}

  total() {
    return this.#sets.values().reduce((t, c) => c + t, 0);
  }

  *[Symbol.iterator]() {
    yield* this.#sets;
  }
}

export function counter<T>(iterable?: Iterable<T>) {
  return new Counter(iterable);
}
