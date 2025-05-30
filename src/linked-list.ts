import { isIterable, toIterable, mapIterable, MapFn, isAsyncIterable, toAsyncIterable } from "./iterable.ts";
import { Node } from "./node.ts";
import { range } from "./range.ts";

export type IterCallback<T, R> = (val: T, index: number, instance: LinkedList<T>) => R;

export class LinkedList<T> implements Iterable<T> {
  static isCyclic<T>(node: Node<T> | undefined) {
    let slow = node;
    let fast = node?.right;
    while (fast) {
      if (slow === fast) {
        return true;
      }
      slow = slow!.right;
      fast = fast.right?.right;
    }
    return false;
  }

  static from<T>(iterable: Iterable<T> | ArrayLike<T>): LinkedList<T>;
  static from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapFn: MapFn<T, U>): LinkedList<U>;
  static from<T>(iterable: Iterable<T> | ArrayLike<T>, mapFn?: MapFn<T, T>) {
    if (!isIterable(iterable)) {
      iterable = toIterable(iterable);
    }
    if (mapFn) {
      iterable = mapIterable(iterable, mapFn);
    }
    const list = new LinkedList();
    for (const value of iterable) list.push(value);
    return list;
  }

  static async fromAsync<T>(
    iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>
  ) {
    if (!isAsyncIterable(iterableOrArrayLike)) {
      iterableOrArrayLike = toAsyncIterable(iterableOrArrayLike);
    }
    const list = new LinkedList<T>();
    for await (const value of iterableOrArrayLike) list.push(value);
    return list;
  }

  isLinkedList<T>(data: unknown): data is LinkedList<T> {
    return data instanceof LinkedList;
  }

  #head?: Node<T>;
  #tail?: Node<T>;
  #length = 0;

  constructor(...values: T[]) {
    this.push(...values);
  }

  valueOf() {
    return this.#length;
  }

  replace(index: number, value: T) {
    const node = this.nodeAt(index);
    if (!node) return this;
    node.value = value;
    return this;
  }

  push(...values: T[]) {
    for (const value of values) {
      const tail = this.#tail;
      this.#tail = new Node(value, tail);
      this.#head ??= this.#tail;
      if (tail) {
        tail.right = this.#tail;
      }
      this.#length++;
    }
    return this.#length;
  }

  pop(): T | undefined {
    const tail = this.#tail;
    if (!tail) {
      return undefined;
    }
    this.#tail = tail.left;
    if (this.#tail) {
      this.#tail.right = undefined;
    }
    this.#length--;
    return tail.value;
  }

  shift() {
    const head = this.#head;
    if (!head) {
      return undefined;
    }
    this.#head = head.right;
    if (this.#head) {
      this.#head.left = undefined;
    }
    this.#length--;
    return head.value;
  }

  unshift(...values: T[]) {
    for (const value of values) {
      const head = this.#head;
      this.#head = new Node(value, undefined, head);
      if (head) {
        head.left = this.#head;
      }
      this.#tail ??= this.#head;
      this.#length++;
    }
    return this.#length;
  }

  deleteNode(node: Node<T>) {
    this.#length--;
    if (node === this.#head && node == this.#tail) {
      // only node available
      this.#head = this.#tail = undefined;
      return this;
    }
    if (node === this.#head) {
      this.#head = node.right;
      node.right = undefined;
      this.#head!.left = undefined;
      return this;
    }

    if (node === this.#tail) {
      this.#tail = node.left;
      node.left = undefined;
      this.#tail!.right = undefined;
      return this;
    }
    node.left!.right = node.right;
    node.right!.left = node.left;
    node.left = undefined;
    node.right = undefined;
    return this;
  }

  delete(node: Node<T> | T | undefined): this {
    if (!node) {
      return this;
    }
    if (node instanceof Node) {
      return this.deleteNode(node);
    }
    return this.delete(this.findNode((x) => x === node));
  }

  reverse() {
    let current = this.#head;
    let prev: Node<T> | undefined;
    while (current) {
      [current.right, current.left] = [current.left, current.right];
      prev = current;
      current = current.left;
    }
    this.#tail = this.#head;
    this.#head = prev;
    return this;
  }

  toString() {
    return this.map((x) => JSON.stringify(x)).join(" ⇄ ");
  }

  at(index: number) {
    return this.nodeAt(index)?.value;
  }

  nodeOf(value: T) {
    for (const node of this.nodes()) {
      if (node.value === value) {
        return node;
      }
    }
  }

  concat(...lists: LinkedList<T>[]) {
    const final = LinkedList.from(this);
    for (const list of lists) list.forEach((x) => final.push(x));
    return final;
  }

  indexOf(value: T) {
    for (const [index, item] of this.entries()) {
      if (item === value) {
        return index;
      }
    }
    return -1;
  }

  findNode(callback: IterCallback<T, boolean>) {
    let i = 0;
    for (const node of this.nodes()) {
      if (callback(node.value, i, this)) {
        return node;
      }
      i++;
    }
  }

  join(separator: string) {
    return [...this].join(separator);
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
    return -1;
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
        tail = tail.left;
        index++;
      }
      return tail;
    }

    let current = this.#head;
    while (current && index > 0) {
      current = current.right;
      index--;
    }
    return current;
  }

  filter(callback: IterCallback<T, unknown>) {
    const list = new LinkedList<T>();
    for (const [index, value] of this.entries()) {
      if (callback(value, index, this)) {
        list.push(value);
      }
    }
    return list;
  }

  splice(start: number, end = this.length - start) {
    const list = new LinkedList<T>();
    if (start >= this.#length) {
      return list;
    }
    let node = this.nodeAt(start)!;
    for (const _ of range(end)) {
      list.push(node.value);
      const nxt = node.right;
      this.deleteNode(node);
      if (!nxt) break;
      node = nxt;
    }
    return list;
  }

  slice(start: number, end = this.length - start) {
    const list = new LinkedList<T>();
    let node = this.nodeAt(start);
    for (const _ of range(start, end)) {
      if (!node) break;
      const r = node.right;
      list.push(node.value);
      node = r;
    }
    return list;
  }

  *entries(): Generator<[index: number, value: T]> {
    let index = 0;
    for (const node of this.nodes()) {
      if (index === this.#length) {
        throw new RangeError("Circular list detected", { cause: "Circular List" });
      }
      yield [index, node.value];
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
    for (const [index, value] of this.entries()) {
      acc = callback(acc, value, index, this);
    }
    return acc;
  }

  sort(compareFn: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)): this {
    function mergeSort(head: Node<T> | undefined): Node<T> | undefined {
      if (!head || !head.right) return head;
      const mid = getMiddle(head);
      const rightHead = mid.right;
      mid.right = undefined;
      if (rightHead) rightHead.left = undefined;
      const leftSorted = mergeSort(head);
      const rightSorted = mergeSort(rightHead);
      return merge(leftSorted, rightSorted);
    }

    function getMiddle(head: Node<T>): Node<T> {
      let slow = head,
        fast = head;
      while (fast.right && fast.right.right) {
        slow = slow.right!;
        fast = fast.right.right;
      }
      return slow;
    }

    const merge = (l1: Node<T> | undefined, l2: Node<T> | undefined): Node<T> | undefined => {
      // deno-lint-ignore no-explicit-any
      const dummy = new Node<T>(null as any);
      let current = dummy;

      while (l1 && l2) {
        if (compareFn(l1.value, l2.value) <= 0) {
          current.right = l1;
          l1.left = current;
          l1 = l1.right;
        } else {
          current.right = l2;
          l2.left = current;
          l2 = l2.right;
        }
        current = current.right;
      }

      if (l1) {
        current.right = l1;
        l1.left = current;
      }

      if (l2) {
        current.right = l2;
        l2.left = current;
      }

      // Fix head/tail
      const newHead = dummy.right;
      if (newHead) newHead.left = undefined;

      this.#head = newHead;
      let newTail = newHead;
      while (newTail && newTail.right) newTail = newTail.right;
      this.#tail = newTail;

      return newHead;
    };

    this.#head = mergeSort(this.#head);

    return this;
  }

  some(callback: IterCallback<T, boolean>) {
    for (const [index, value] of this.entries()) {
      if (callback(value, index, this)) {
        return true;
      }
    }
    return false;
  }

  every(callback: IterCallback<T, boolean>) {
    for (const [index, value] of this.entries()) {
      if (!callback(value, index, this)) {
        return false;
      }
    }
    return true;
  }

  *reversedNodes(tail = this.#tail): Generator<Node<T>> {
    let current = tail;
    while (current) {
      yield current;
      current = current.left;
    }
  }

  fill(value: T, start = 0, end = this.#length) {
    let len = end - start;
    for (const node of this.nodes(this.nodeAt(start))) {
      if (len < 1) break;
      node.value = value;
      len--;
    }
    return this;
  }

  toSorted(compareFn: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
    return LinkedList.from(this).sort(compareFn);
  }

  toSpliced(start: number, end?: number) {
    return LinkedList.from(this).splice(start, end);
  }

  toReversed() {
    return LinkedList.from(this).reverse();
  }

  *nodes(head = this.#head): Generator<Node<T>> {
    let current = head;
    while (current) {
      yield current;
      current = current.right;
    }
  }

  toJSON() {
    return "[" + this.map((x) => JSON.stringify(x)).join(",") + "]";
  }

  get head() {
    return this.#head;
  }

  get tail() {
    return this.#tail;
  }

  get first() {
    return this.head?.value;
  }

  get last() {
    return this.tail?.value;
  }

  get length() {
    return this.#length;
  }

  set length(length: number) {
    if (length > this.#length) {
      throw new Error("Can't set exceeding length");
    }

    if (length === this.#length) return;

    if (length === 0) {
      this.#head = this.#tail = undefined;
      this.#length = length;
      return;
    }

    const node = this.nodeAt(length)!;
    node.right = undefined;
    if (node.left) node.left.right = undefined;
    this.#tail = node;
    this.#length = length;
  }

  get array() {
    return Array.from(this);
  }

  *[Symbol.iterator]() {
    for (const node of this.nodes()) {
      yield node.value;
    }
  }
}
