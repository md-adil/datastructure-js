export function bin(x: number, pad = 0) {
  const y = x.toString(2);
  return pad ? y.padStart(pad, "0") : y;
}

export function getBit(num: number, position: number) {
  return (num >> position) & 1;
}

export function setBit(num: number, position: number): number {
  return num | (1 << position);
}

export function toggleBit(num: number, position: number): number {
  return num ^ (1 << position);
}

export function clearBit(num: number, position: number): number {
  return num & ~(1 << position);
}
