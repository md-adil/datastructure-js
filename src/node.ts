export class Node<T> implements Iterable<T> {
  static ensure<T>(value: T | Node<T>) {
    return value instanceof Node ? value : new Node(value);
  }

  constructor(public value: T, public left?: Node<T>, public right?: Node<T>) {}

  valueOf() {
    return this.value;
  }

  *[Symbol.iterator]() {
    // deno-lint-ignore no-this-alias
    let current: Node<T> | undefined = this;
    while (current) {
      yield current.value;
      current = current.right;
    }
  }

  *reversed() {
    // deno-lint-ignore no-this-alias
    let current: Node<T> | undefined = this;
    while (current) {
      yield current.value;
      current = current.left;
    }
  }
}
