import { deque } from "./src/deque.ts";
import { range } from "./src/range.ts";

const q = deque(...range(100).toReversed());
while (q.length) {
  console.log(q.pop());
}
console.log("length", q.length);
