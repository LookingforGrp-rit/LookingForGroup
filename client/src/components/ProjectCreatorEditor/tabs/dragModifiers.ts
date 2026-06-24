import type { Modifier } from '@dnd-kit/core';

const clamp = (value: number, min: number, max: number) => {
  if (min > max) {
    return value;
  }
  return Math.min(Math.max(value, min), max);
};

export const clampDragWithinContainer: Modifier = ({
  transform,
  activeNodeRect,
  containerNodeRect,
}) => {
  if (!activeNodeRect || !containerNodeRect) {
    return transform;
  }

  const minY = containerNodeRect.top - activeNodeRect.top;
  const maxY = containerNodeRect.bottom - activeNodeRect.bottom;
  const minX = containerNodeRect.left - activeNodeRect.left;
  const maxX = containerNodeRect.right - activeNodeRect.right;

  return {
    x: clamp(transform.x, minX, maxX),
    y: clamp(transform.y, minY, maxY),
  };
};
