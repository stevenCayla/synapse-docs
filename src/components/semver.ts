// Tiny semver helpers for the page version notices ("MAJOR.MINOR[.PATCH]").
const parts = (v: string) => v.split('.').map((n) => parseInt(n, 10) || 0);

export function compareVersions(a: string, b: string): number {
  const [x, y] = [parts(a), parts(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return d;
  }
  return 0;
}
