export class SkipNode<T> {
  constructor(public value: T, public forwards: SkipNode<T>[] = []) {}
}

export class SkipList<T> {
  private maxLevel = 4;
  private probability = 0.5;
  private head: SkipNode<T> = new SkipNode<T>(
    null as any,
    Array(this.maxLevel).fill(null)
  );
  private level = 1;

  private randomLevel(): number {
    let lvl = 1;
    while (Math.random() < this.probability && lvl < this.maxLevel) lvl++;
    return lvl;
  }

  insert(value: T) {
    const update: SkipNode<T>[] = Array(this.maxLevel).fill(this.head);
    let current = this.head;

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forwards[i] && current.forwards[i]!.value < value) {
        current = current.forwards[i]!;
      }
      update[i] = current;
    }

    const newLevel = this.randomLevel();
    const newNode = new SkipNode<T>(value, Array(newLevel).fill(null));

    for (let i = 0; i < newLevel; i++) {
      newNode.forwards[i] = update[i].forwards[i];
      update[i].forwards[i] = newNode;
    }

    this.level = Math.max(this.level, newLevel);
  }

  search(value: T): boolean {
    let current = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forwards[i] && current.forwards[i]!.value < value) {
        current = current.forwards[i]!;
      }
    }
    current = current.forwards[0]!;
    return current?.value === value;
  }
}
