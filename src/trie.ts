export class TrieNode {
  readonly children: Record<string, TrieNode> = {};
  isEnd: boolean = false;
}

export class Trie {
  #length = 0;
  root = new TrieNode();

  constructor(...args: string[]) {
    this.insert(...args);
  }

  get length() {
    return this.#length;
  }

  insert(...words: string[]) {
    for (const word of words) {
      let curr = this.root;
      for (const w of word) {
        if (!(w in curr.children)) {
          curr.children[w] = new TrieNode();
        }
        curr = curr.children[w];
      }
      curr.isEnd = true;
      this.#length++;
    }
    return this.#length;
  }

  delete(...words: string[]): number {
    function _delete(node: TrieNode, word: string, depth: number): boolean {
      if (depth === word.length) {
        if (!node.isEnd) return false;
        node.isEnd = false;
        return Object.keys(node.children).length === 0;
      }
      const char = word[depth];
      const child = node.children[char];
      if (!child) return false;

      const shouldDeleteChild = _delete(child, word, depth + 1);
      if (shouldDeleteChild) {
        delete node.children[char];
        return !node.isEnd && Object.keys(node.children).length === 0;
      }
      return false;
    }

    for (const word of words) {
      if (_delete(this.root, word, 0)) {
        this.#length--;
      }
    }

    return this.#length;
  }

  #findNode(word: string) {
    let node = this.root;
    for (const w of word) {
      if (!(w in node.children)) {
        return;
      }
      node = node.children[w];
    }

    return node;
  }

  includes(word: string) {
    return this.#findNode(word)?.isEnd;
  }

  *#iterateNode(node: TrieNode, part = ""): Generator<string> {
    if (node.isEnd) {
      yield part;
    }
    for (const [char, curr] of Object.entries(node.children)) {
      yield* this.#iterateNode(curr, part + char);
    }
  }

  *startsWith(word: string) {
    const node = this.#findNode(word);
    if (!node) {
      return;
    }
    yield* this.#iterateNode(node, word);
  }

  *[Symbol.iterator]() {
    yield* this.#iterateNode(this.root, "");
  }
}
