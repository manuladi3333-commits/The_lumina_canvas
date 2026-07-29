// Owns the brush hardness value only (edge softness).

// Bounds on a 0-1 scale. Exported so sliders clamp to the same limits.
export const BRUSH_HARDNESS_MIN = 0;
export const BRUSH_HARDNESS_MAX = 1;
export const BRUSH_HARDNESS_DEFAULT = 1;

export let brushHardness = BRUSH_HARDNESS_DEFAULT;

// Coerces (slider events give strings), rejects NaN/null/undefined,
// and clamps to 0-1. Invalid input leaves the current hardness unchanged.
// 1 = hard edge, 0 = soft/feathered edge. 0 is valid, not an error.
export function setBrushHardness(newHardness) {
  const parsed = Number(newHardness);

    if (!Number.isFinite(parsed)) {
        return brushHardness;
          }

            brushHardness = Math.min(BRUSH_HARDNESS_MAX, Math.max(BRUSH_HARDNESS_MIN, parsed));
              return brushHardness;
              }