export class Node<T> {
  static ensure<T>(value: T | Node<T>) {
    return value instanceof Node ? value : new Node(value);
  }
  constructor(public value: T, public left?: Node<T>, public right?: Node<T>) {}
}
