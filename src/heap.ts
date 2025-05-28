import { Queue } from "./index.ts";

export class Heap {
  static from(iterable: Iterable<number> | ArrayLike<number>) {
    const heap = new Heap(Array.from(iterable));
    return heap.toHeap();
  }

  #list: number[] = [];

  constructor(list: number[] = []) {
    this.#list = list;
  }

  get length() {
    return this.#list.length;
  }

  toHeap() {
    const start = Math.floor(this.#list.length / 2) - 1; // Last parent node
    for (let i = start; i >= 0; i--) {
      this.#down(i);
    }
    return this;
  }

  #down(index: number) {
    if (index < this.length) {
      const children = this.#children(index);
      if (!children.length) {
        return;
      }
      let child = children[0]!;
      if (
        children.length > 1 &&
        this.#list[children[1]!] < this.#list[children[0]!]
      ) {
        child = children[1]!;
      }

      if (this.#list[child] < this.#list[index]) {
        this.#swap(index, child);
        this.#down(child);
      }
    }
  }

  #parent(index: number) {
    return Math.floor((index - 1) / 2);
  }

  #children(index: number) {
    const size = this.#list.length;
    const children: [left?: number, right?: number] = [];

    const left = 2 * index + 1;
    if (left < size) {
      children.push(left);
    }

    const right = left + 1;
    if (right < size) {
      children.push(right);
    }

    return children;
  }

  toArray() {
    return this.#list;
  }

  #swap(left: number, right: number) {
    [this.#list[left], this.#list[right]] = [
      this.#list[right],
      this.#list[left],
    ];
    return this;
  }

  #up(index: number) {
    const parent = this.#parent(index);
    if (parent < 0) {
      return;
    }
    if (this.#list[parent] > this.#list[index]) {
      this.#swap(index, parent);
      this.#up(parent);
    }
  }

  push(value: number) {
    this.#list.push(value);
    this.#up(this.#list.length - 1);
    return this;
  }

  peek() {
    return this.#list[0];
  }

  pop() {
    const length = this.#list.length;
    if (!length) {
      return;
    }
    const value = this.#list[0];
    this.#list[0] = this.#list[length - 1];
    this.#list.pop();
    this.#down(0);
    return value;
  }

  *[Symbol.iterator]() {
    if (!this.length) {
      return;
    }

    const queue = new Queue(0);
    while (queue.length) {
      const index = queue.shift()!;
      yield this.#list[index];
      const [left, right] = this.#children(index);
      if (left === undefined) {
        continue;
      }
      if (right === undefined) {
        queue.push(left);
        continue;
      }
      if (this.#list[left] < this.#list[right]) {
        queue.push(left);
        queue.push(right);
        continue;
      }
      queue.push(right);
      queue.push(left);
    }
  }
}

export function heap(list: number[]) {
  return Heap.from(list);
}
