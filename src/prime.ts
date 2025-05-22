export function isPrime(n: number): [prime: boolean, cost: number] {
  let x = 1;
  if (n <= 1) return [false, x];
  if (n <= 3) return [true, x];
  if (n % 2 === 0 || n % 3 === 0) return [false, x];
  for (let i = 5; i * i <= n; i += 6) {
    x++;
    if (n % i === 0 || n % (i + 2) === 0) return [false, x];
  }
  return [true, x];
}
