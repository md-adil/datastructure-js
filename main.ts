import { LinkedList } from "./src/linked-list.ts";

const list = new LinkedList(12, 2, 33);

for (const item of list.sort().reverse()) {
  console.log({ item });
}
