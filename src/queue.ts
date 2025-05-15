export class Queue<T> {
  #data: T[];
  index = 0;
  get length() {
    return this.#data.length - this.index;
  }

  constructor(...data: T[]) {
    this.#data = data;
  }

  #resize() {
    this.#data = this.#data.slice(this.index);
    this.index = 0;
  }

  push(val: T) {
    this.#data.push(val);
  }

  pop() {
    return this.#data.pop();
  }

  shift() {
    if (this.#data.length === 0) {
      return;
    }
    if (this.index > this.#data.length / 2) {
      this.#resize();
    }
    const val = this.#data[this.index];
    this.index++;
    return val;
  }

  unshift(val: T) {
    if (this.index > 0) {
      this.index--;
      this.#data[this.index] = val;
      return this;
    }
    this.#data.unshift(val);
    return this;
  }
  first() {
    return this.#data[this.index];
  }
  last() {
    return this.#data[this.#data.length - 1];
  }
  *[Symbol.iterator]() {
    for (let i = this.index; i < this.#data.length; i++) {
      yield this.#data[i];
    }
  }
}
