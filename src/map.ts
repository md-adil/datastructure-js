function toValue<T>(value: T | (() => T)) {
  if (typeof value === "function") {
    return (value as CallableFunction)();
  }
  return value;
}

class DefaultMap<K, V> {
  public readonly map = new Map<K, V>();
  constructor(private def: V | (() => V)) {}
  get(key: K) {
    if (!this.map.has(key)) {
      this.map.set(key, toValue(this.def));
    }
    return this.map.get(key)!;
  }
  set(key: K, value: V) {
    return this.map.set(key, value);
  }
}

export function defaultMap<K, V>(def: V | (() => V)) {
  return new DefaultMap<K, V>(def);
}
