export function isIterable<T>(value: unknown): value is Iterable<T> {
  return typeof value === "object" && value !== null && Symbol.iterator in value;
}

export function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  return typeof value === "object" && value !== null && Symbol.asyncIterator in value;
}

export function* toIterable<T>(values: ArrayLike<T>) {
  for (let i = 0; i < values.length; i++) {
    yield values[i];
  }
}

export type MapFn<T, U> = (value: T, index: number) => U;
export function* mapIterable<T, U>(iterable: Iterable<T>, mapFn: MapFn<T, U>): Generator<U> {
  let index = 0;
  for (const value of iterable) {
    yield mapFn(value, index);
    index++;
  }
}

export async function* toAsyncIterable<T>(iterable: Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>) {
  if (!isIterable(iterable)) {
    iterable = toIterable(iterable);
  }
  for (const value of iterable) {
    yield await value;
  }
}
