export type IterCallback<T, R, S, I = number> = (val: T, index: I, instance: S) => R;

export type UintArray = Uint8Array | Uint16Array | Uint32Array;
