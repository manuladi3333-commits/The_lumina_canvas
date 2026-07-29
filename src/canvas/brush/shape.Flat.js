// Defines the flat brush tip shape only.
//
// Contract (must match every other tip file):
//   ctx  - CanvasRenderingContext2D
//   x, y - center of the dab, in canvas px
//   size - WIDTH in canvas px; height is derived from the aspect ratio
//
// Caller must set ctx.fillStyle and ctx.globalAlpha before calling.
// This file owns shape only, never color or alpha.

// Height = width / this. 2 gives a 2:1 chisel tip.
// Change here only; the offsets below derive from it.
const FLAT_ASPECT_RATIO = 2;

export function drawFlatTip(ctx, x, y, size) {
  // Non-finite values make fillRect silently no-op. Negative size does
    // NOT throw here (unlike ctx.arc) - it draws a mirrored, offset dab,
      // which is worse: wrong output with no error. Skip instead.
        if (!ctx) return false;
          if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(size)) return false;
            if (size <= 0) return false;

              const height = size / FLAT_ASPECT_RATIO;

                ctx.fillRect(x - size / 2, y - height / 2, size, height);
                  return true;
                  }