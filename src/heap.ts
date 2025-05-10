export class Heap {
  #list: number[] = [];

  constructor(...list: number[]) {
    this.#list = list;
    this.#toHeap();
  }

  get length() {
    return this.#list.length;
  }

  #toHeap() {
    const start = Math.floor(this.#list.length / 2) - 1; // Last parent node
    for (let i = start; i >= 0; i--) {
      this.#heapDown(i);
    }
  }

  #heapDown(index: number) {
    if (index < this.length) {
      const children = this.#children(index);
      if (!children.length) {
        return;
      }
      let child = children[0]!;
      if (children.length > 1 && this.#list[children[1]!] < this.#list[children[0]!]) {
        child = children[1]!;
      }

      if (this.#list[child] < this.#list[index]) {
        this.#swap(index, child);
        this.#heapDown(child);
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
    [this.#list[left], this.#list[right]] = [this.#list[right], this.#list[left]];
    return this;
  }

  #heapUp(index: number) {
    const parent = this.#parent(index);
    if (parent < 0) {
      return;
    }
    if (this.#list[parent] > this.#list[index]) {
      this.#swap(index, parent);
      this.#heapUp(parent);
    }
  }

  push(value: number) {
    this.#list.push(value);
    this.#heapUp(this.#list.length - 1);
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
    this.#heapDown(0);
    return value;
  }

  *[Symbol.iterator]() {
    if (!this.length) {
      return;
    }

    const queue = [0];
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
