export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const range = (t: number, a: number, b: number) =>
  clamp01((t - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smoothstep = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

export const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};
