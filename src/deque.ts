export class Deque<T> {
  #bucket;
  #front = 0;
  #back = 0;

  constructor(...data: T[]) {
    this.#bucket = data;
  }

  at(index: number) {
    if (index < 0 || index >= this.length) return;
    return this.#bucket[this.#front + index];
  }

  get length() {
    return this.#bucket.length - this.#front - this.#back;
  }

  push(val: T) {
    if (this.#back === 0) {
      this.#bucket.push(val);
    } else {
      this.#bucket[this.#bucket.length - --this.#back - 1] = val;
    }
    return this.length;
  }

  unshift(val: T) {
    const length = this.#bucket.length;
    if (length === 0) {
      this.#bucket.push(val);
      return this.length;
    }

    if (this.#front === 0) {
      this.#bucket = Array.from<T>({ length }).concat(this.#bucket);
      this.#front = length;
    }

    this.#front--;
    this.#bucket[this.#front] = val;
    return this.length;
  }

  #resize() {
    this.#bucket = this.#bucket.slice(this.#front, this.#bucket.length - this.#back);
    this.#front = this.#back = 0;
  }

  shift() {
    if (this.length === 0) return;
    const val = this.#bucket[this.#front];
    this.#front++;
    if (this.#front > Math.ceil(this.#bucket.length / 2)) this.#resize();
    return val;
  }

  pop() {
    if (this.length === 0) return;
    const val = this.#bucket[this.#bucket.length - 1 - this.#back];
    this.#back++;
    if (this.#back > Math.ceil(this.#bucket.length / 2)) this.#resize();
    return val;
  }

  first() {
    if (!this.length) return;
    return this.#bucket[this.#front];
  }

  *entries() {
    let index = 0,
      current = this.#front;
    while (current < this.#bucket.length - this.#back) {
      yield [index++, this.#bucket[current++]];
    }
  }

  last() {
    if (!this.length) return;
    return this.#bucket[this.#bucket.length - 1 - this.#back];
  }

  get bucket() {
    return this.#bucket;
  }

  *[Symbol.iterator]() {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }
}

export function deque<T>(...args: T[]) {
  return new Deque(...args);
}
