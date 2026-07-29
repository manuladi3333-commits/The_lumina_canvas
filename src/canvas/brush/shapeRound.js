// Defines the round brush tip shape only.
//
// Contract:
//   ctx  - CanvasRenderingContext2D
//   x, y - center of the dab, in canvas px
//   size - DIAMETER in canvas px (not radius)
//
// Caller must set ctx.fillStyle and ctx.globalAlpha before calling.
// This file owns shape only, never color or alpha.
export function drawRoundTip(ctx, x, y, size) {
  // Non-finite values make canvas silently discard the path op,
    // and a negative radius makes ctx.arc throw IndexSizeError
      // mid-stroke. Skip the dab instead of breaking the whole stroke.
        if (!ctx) return false;
          if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(size)) return false;
            if (size <= 0) return false;

              ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                  ctx.fill();
                    return true;
                    }