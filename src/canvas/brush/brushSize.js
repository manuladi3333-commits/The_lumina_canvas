// Owns the brush size value only.

// Bounds in canvas px. Exported so sliders clamp to the same limits.
export const BRUSH_SIZE_MIN = 1;
export const BRUSH_SIZE_MAX = 100;
export const BRUSH_SIZE_DEFAULT = 5;

export let brushSize = BRUSH_SIZE_DEFAULT;

// Coerces (slider events give strings), rejects NaN/null/undefined,
// and clamps to bounds. Invalid input leaves the current size unchanged.
export function setBrushSize(newSize) {
  const parsed = Number(newSize);

    if (!Number.isFinite(parsed)) {
        return brushSize;
          }

            brushSize = Math.min(BRUSH_SIZE_MAX, Math.max(BRUSH_SIZE_MIN, Math.round(parsed)));
              return brushSize;
              }