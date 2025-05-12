import { Heap } from "./heap.ts";

export class PriorityQueue<T> {
  length = 0;
  heap = new Heap();
  values = new Map<number, T[]>();
  constructor(...queues: [number, T][]) {
    queues.forEach((value) => this.push(...value));
  }

  push(p: number, value: T) {
    this.length++;
    if (!this.values.has(p)) {
      this.heap.push(p);
      this.values.set(p, [value]);
      return this;
    }
    this.values.get(p)!.push(value);
    return this;
  }

  pop() {
    const key = this.heap.peek();
    if (!key) return;
    const values = this.values.get(key);
    if (!values) {
      return;
    }
    this.length--;
    const value = values.pop();
    if (!values.length) {
      this.heap.pop();
    }
    return value;
  }

  peek() {
    const key = this.heap.peek();
    if (!key) return;
    const values = this.values.get(key);
    if (!values) {
      return;
    }
    const value = values[values.length - 1];
    return value;
  }

  *entries() {
    for (const key of this.heap) {
      for (const value of this.values.get(key)!) {
        yield [key, value];
      }
    }
  }

  *[Symbol.iterator]() {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }
}
