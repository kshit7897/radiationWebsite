"use client";

export type Triple = readonly [number, number, number];

export type Keyframe<T> = {
  at: number;
  value: T;
};

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

export const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

export const segment = (story: number, from: number, to: number) =>
  smooth((story - from) / (to - from));

export const fadeBetween = (
  story: number,
  inFrom: number,
  inTo: number,
  outFrom: number,
  outTo: number
) => segment(story, inFrom, inTo) * (1 - segment(story, outFrom, outTo));

export function sampleNumber(story: number, frames: readonly Keyframe<number>[]) {
  if (story <= frames[0].at) return frames[0].value;

  for (let index = 1; index < frames.length; index++) {
    const previous = frames[index - 1];
    const next = frames[index];

    if (story <= next.at) {
      const progress = smooth((story - previous.at) / (next.at - previous.at));
      return mix(previous.value, next.value, progress);
    }
  }

  return frames[frames.length - 1].value;
}

export function sampleTriple(story: number, frames: readonly Keyframe<Triple>[]) {
  if (story <= frames[0].at) return frames[0].value;

  for (let index = 1; index < frames.length; index++) {
    const previous = frames[index - 1];
    const next = frames[index];

    if (story <= next.at) {
      const progress = smooth((story - previous.at) / (next.at - previous.at));

      return [
        mix(previous.value[0], next.value[0], progress),
        mix(previous.value[1], next.value[1], progress),
        mix(previous.value[2], next.value[2], progress),
      ] as Triple;
    }
  }

  return frames[frames.length - 1].value;
}
