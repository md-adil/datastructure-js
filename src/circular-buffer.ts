import { range } from "./range.ts";

export class CircularBuffer<T> {
  buffer: T[];
  front = 0;
  rear = 0;
  #count = 0;

  constructor(private size: number) {
    this.buffer = new Array<T>(size);
  }

  get length() {
    return this.#count;
  }

  queue(value: T) {
    this.buffer[this.front] = value;
    this.front = (this.front + 1) % this.size;
    if (this.#count === this.size) {
      this.rear = (this.rear + 1) % this.size;
    } else {
      this.#count++;
    }
  }

  get isEmpty() {
    return this.#count === 0;
  }

  peek() {
    return this.buffer[this.rear];
  }

  dequeue() {
    if (this.isEmpty) {
      return;
    }
    const value = this.buffer[this.rear];
    delete this.buffer[this.rear];
    this.rear = (this.rear + 1) % this.size;
    this.#count--;
    return value;
  }

  *[Symbol.iterator]() {
    let index = this.rear;
    for (const _ of range(this.#count)) {
      yield this.buffer[index];
      index = (index + 1) % this.size;
    }
  }
}
