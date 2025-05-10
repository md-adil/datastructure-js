import { Node } from "./node.ts";

export class BinarySearchTree<T = number> {
  #root?: Node<T>;

  constructor(...values: T[]) {
    values.forEach((x) => {
      this.insert(x);
    });
  }

  insert(value: T | Node<T>) {
    const vNode = Node.ensure(value);
    if (!this.#root) {
      this.#root = vNode;
      return this;
    }
    function doInsert(current: Node<T>, vNode: Node<T>) {
      if (vNode.value < current.value) {
        if (current.left) {
          doInsert(current.left, vNode);
          return;
        }
        current.left = vNode;
        return;
      }
      if (current.right) {
        doInsert(current.right, vNode);
        return;
      }
      current.right = vNode;
    }
    doInsert(this.#root, vNode);
    return this;
  }

  minNode() {
    let current = this.#root;
    if (!current) return;
    if (!current.left) {
      return current;
    }
    while (current.left) {
      current = current.left;
    }
    return current;
  }

  min() {
    return this.minNode()?.value;
  }

  max() {
    return this.maxNode()?.value;
  }

  maxNode() {
    let current = this.#root;
    if (!current) return;
    if (!current.right) {
      return current;
    }
    while (current.right) {
      current = current.right;
    }
    return current;
  }

  remove(value: T) {
    function removeNode(node: Node<T> | undefined, value: T) {
      if (!node) {
        return;
      }
      if (value < node.value) {
        node.left = removeNode(node.left, value);
      } else if (value > node.value) {
        node.right = removeNode(node.right, value);
      } else {
        if (!node.left && !node.right) {
          return;
        }
        if (!node.left) {
          return node.right;
        }
        if (!node.right) {
          return node.left;
        }
        let smallest = node.right;
        while (smallest.left) {
          smallest = smallest.left;
        }
        node.value = smallest.value;
        node.right = removeNode(node.right, smallest.value);
      }
      return node;
    }

    this.#root = removeNode(this.#root, value);
  }

  maxDepth() {
    function findDepth(node: Node<T> | undefined): number {
      if (!node) return 0;
      return 1 + Math.max(findDepth(node.left), findDepth(node.right));
    }
    return findDepth(this.#root);
  }

  toString() {
    function printBST(node: Node<T> | undefined, prefix = "", isLeft = true) {
      if (!node) return;

      if (node.right) {
        printBST(node.right, prefix + (isLeft ? "│   " : "    "), false);
      }

      console.log(prefix + (isLeft ? "└── " : "┌── ") + node.value);

      if (node.left) {
        printBST(node.left, prefix + (isLeft ? "    " : "│   "), true);
      }
    }

    return printBST(this.#root);
  }

  isBalanced(factor = 1) {
    function checkHeight(node: Node<T> | undefined): number {
      if (!node) return 0; // Empty tree is height 0 and balanced

      const leftHeight = checkHeight(node.left);
      if (leftHeight === -1) return -1; // Left subtree is not balanced

      const rightHeight = checkHeight(node.right);
      if (rightHeight === -1) return -1; // Right subtree is not balanced

      if (Math.abs(leftHeight - rightHeight) > factor) {
        return -1; // Current node is not balanced
      }

      return Math.max(leftHeight, rightHeight) + 1; // Return height
    }

    return checkHeight(this.#root) !== -1;
  }

  *[Symbol.iterator]() {
    function* traverse(current?: Node<T>): Generator<T> {
      if (!current) return;
      yield* traverse(current.left);
      yield current.value;
      yield* traverse(current.right);
    }
    yield* traverse(this.#root);
  }
}
