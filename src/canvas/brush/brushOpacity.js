// Owns the brush opacity value only.

// Bounds on a 0-1 scale. Exported so sliders clamp to the same limits.
export const BRUSH_OPACITY_MIN = 0;
export const BRUSH_OPACITY_MAX = 1;
export const BRUSH_OPACITY_DEFAULT = 1;

export let brushOpacity = BRUSH_OPACITY_DEFAULT;

// Coerces (slider events give strings), rejects NaN/null/undefined,
// and clamps to 0-1. Invalid input leaves the current opacity unchanged.
// Note: 0 is a valid value here (fully transparent), unlike brush size.
// 1 = fully opaque, 0 = fully transparent.
export function setBrushOpacity(newOpacity) {
  const parsed = Number(newOpacity);

    if (!Number.isFinite(parsed)) {
        return brushOpacity;
          }

            brushOpacity = Math.min(BRUSH_OPACITY_MAX, Math.max(BRUSH_OPACITY_MIN, parsed));
              return brushOpacity;
              }