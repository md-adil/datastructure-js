import { Node } from "./node.ts";

export interface LinkedList<T> {
  [key: number]: T;
}

export type IterCallback<T, R> = (val: T, index: number, instance: LinkedList<T>) => R;

export class LinkedList<T> {
  static fromArray<T>(values: T[]) {
    return new LinkedList<T>(...values);
  }

  #head?: Node<T>;
  #tail?: Node<T>;
  #length = 0;

  constructor(...values: T[]) {
    values.forEach(this.push.bind(this));
  }

  push(value: T) {
    const tail = this.#tail;
    this.#tail = new Node(value, undefined, tail);
    this.#head ??= this.#tail;
    if (tail) {
      tail.left = this.#tail;
    }
    this.#length++;
  }

  pop(): T | undefined {
    const tail = this.#tail;
    if (!tail) {
      return undefined;
    }
    this.#tail = tail.right;
    if (this.#tail) {
      this.#tail.left = undefined;
    }
    this.#length--;
    return tail.value;
  }

  shift() {
    const head = this.#head;
    if (!head) {
      return undefined;
    }
    this.#head = head.left;
    if (this.#head) {
      this.#head.right = undefined;
    }
    this.#length--;
    return head;
  }

  unshift(value: T) {
    const head = this.#head;
    this.#head = new Node(value, head);
    if (head) {
      head.right = this.#head;
    }
    this.#tail ??= this.#head;
    this.#length++;
  }

  reverse() {
    let current = this.#head;
    let prev: Node<T> | undefined;
    while (current) {
      [current.right, current.left] = [current.left, current.right];
      prev = current;
      current = current.right;
    }
    this.#tail = this.#head;
    this.#head = prev;
    return this;
  }

  toString() {
    return [...this].join(" ⇄ ");
  }

  at(index: number) {
    return this.nodeAt(index)?.value;
  }

  findNode(callback: IterCallback<T, boolean>) {
    for (const [index, value] of this.entries()) {
      if (callback(value, index, this)) {
        return value;
      }
    }
  }

  find(callback: IterCallback<T, boolean>) {
    for (const [index, value] of this.entries()) {
      if (callback(value, index, this)) {
        return value;
      }
    }
  }

  findIndex(callback: IterCallback<T, boolean>) {
    for (const [index, value] of this.entries()) {
      if (callback(value, index, this)) {
        return index;
      }
    }
  }

  nodeAt(index: number): Node<T> | undefined {
    if (index > this.#length - 1) {
      return;
    }

    if (index > this.#length / 2) {
      index = index - this.#length;
    }

    if (index < 0) {
      let tail = this.#tail;
      while (tail && index < -1) {
        tail = tail.right;
        index++;
      }
      return tail;
    }

    let current = this.#head;
    while (current && index > 0) {
      current = current.left;
      index--;
    }

    return current;
  }

  filter(callback: IterCallback<T, boolean>) {
    const list = new LinkedList<T>();
    let index = 0;
    for (const item of this) {
      if (callback(item, index, this)) {
        list.push(item);
      }
      index++;
    }
    return list;
  }

  *entries(): Generator<[index: number, value: T]> {
    let index = 0;
    for (const value of this) {
      yield [index, value];
      index++;
    }
  }

  forEach(callback: IterCallback<T, void>) {
    for (const [index, value] of this.entries()) {
      callback(value, index, this);
    }
  }

  map<U>(callback: IterCallback<T, U>) {
    const list = new LinkedList<U>();
    for (const [index, value] of this.entries()) {
      list.push(callback(value, index, this));
    }
    return list;
  }

  includes(value: T): boolean {
    for (const item of this) {
      if (item === value) return true;
    }
    return false;
  }

  reduce<U>(callback: (acc: U, val: T, i: number, list: LinkedList<T>) => U, initial: U): U {
    let acc = initial;
    let i = 0;
    for (const val of this) {
      acc = callback(acc, val, i, this);
      i++;
    }
    return acc;
  }

  clear() {
    this.#head = this.#tail = undefined;
    this.#length = 0;
  }

  get length() {
    return this.#length;
  }

  sort(compareFn?: (a: T, b: T) => number): this {
    if (this.#length < 2) return this;

    const mergeSort = (head: Node<T> | undefined): Node<T> | undefined => {
      if (!head || !head.left) return head;

      // Split list
      let slow = head;
      let fast = head.left;

      while (fast && fast.left) {
        slow = slow.left!;
        fast = fast.left.left!;
      }

      const mid = slow.left!;
      slow.left = undefined;
      mid.right = undefined;

      const left = mergeSort(head);
      const right = mergeSort(mid);

      return merge(left, right);
    };

    const merge = (left: Node<T> | undefined, right: Node<T> | undefined): Node<T> => {
      const dummy = new Node<T>(0 as T);
      let current = dummy;

      while (left && right) {
        const cmp = compareFn?.(left.value, right.value) ?? (left.value < right.value ? -1 : 1);
        if (cmp <= 0) {
          current.left = left;
          left.right = current;
          left = left.left;
        } else {
          current.left = right;
          right.right = current;
          right = right.left;
        }
        current = current.left;
      }

      current.left = left || right;
      if (current.left) {
        current.left.right = current;
      }

      const newHead = dummy.left!;
      newHead.right = undefined;

      // Update tail
      let tail = newHead;
      while (tail.left) tail = tail.left;
      this.#tail = tail;

      return newHead;
    };

    this.#head = mergeSort(this.#head);
    return this;
  }

  toJSON() {
    let json = "[";
    const isLast = this.#length - 1;
    let i = 0;
    for (const item of this) {
      json += JSON.stringify(item) + (isLast === i ? "]" : ",");
      i++;
    }
    return json;
  }

  *[Symbol.iterator]() {
    let current = this.#head;
    while (current) {
      yield current.value;
      current = current.left;
    }
  }

  *items() {
    let i = 0;
    for (const item of this) {
      yield [i, item] as const;
      i++;
    }
  }
}
