export function isPrime(n: number): [prime: boolean, iteration: number] {
  if (n <= 1) return [false, 0];
  if (n <= 3) return [true, 0];
  let x = 0;
  if (n % 2 === 0 || n % 3 === 0) return [false, 0];
  for (let i = 5; i * i <= n; i += 6) {
    x++;
    if (n % i === 0 || n % (i + 2) === 0) return [false, x];
  }
  return [true, x];
}
