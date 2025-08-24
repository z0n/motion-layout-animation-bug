import { MotionValue, useTransform } from 'motion/react';
import { interpolate } from 'polymorph-js';

export const getIndex = (_: string, index: number) => index;

export function usePolymorph(progress: MotionValue<number>, paths: string[]) {
  return useTransform(progress, paths.map(getIndex), paths, {
    mixer: (a, b) => interpolate([a, b]),
  });
}
