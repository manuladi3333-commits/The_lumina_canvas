import { brushSize } from "../brush/brushSize.js";
import { brushOpacity } from "../brush/brushOpacity.js";
import { brushHardness } from "../brush/brushHardness.js";
import { drawRoundTip } from "../brush/shapeRound.js";
import { drawFlatTip } from "../brush/shapeFlat.js";

// Handles drawing while dragging mid-stroke only.

// Tip lookup. Adding a shape means adding one line here, not editing
// the dispatch logic below.
// Null prototype: a plain {} would resolve shape names like
// "constructor" or "toString" to inherited functions, which pass the
// fallback check and then throw when called as a tip.
const TIPS = Object.assign(Object.create(null), {
  round: drawRoundTip,
    flat: drawFlatTip,
    });

    // Dab spacing as a fraction of brush width. 0.25 = stamp every quarter
    // width, which reads as a solid line without wasting draw calls.
    const SPACING_RATIO = 0.25;

    // Dabs stamped per move event, hard cap. Prevents a huge jump (finger
    // lifted and replaced, or a dropped frame) from locking the UI.
    // Past this cap dabs spread out, so an extreme jump renders as a
    // gapped stroke rather than a freeze - deliberate tradeoff.
    const MAX_DABS_PER_MOVE = 200;

    // Lower cap when shadow blur is active. Each blurred dab is an
    // offscreen rasterize plus convolve - by far the most expensive thing
    // in this file. 200 of them in one pointer-move handler stalls the
    // stroke on a mid-range phone. Soft strokes trade some smoothness on
    // very fast drags for staying responsive.
    const MAX_DABS_PER_MOVE_BLURRED = 48;

    // Used only if no color is passed in. Replace with a brushColor module
    // once one exists; until then this stops dabs inheriting whatever
    // fillStyle some other draw left on the shared context.
    const FALLBACK_COLOR = "#000000";

    // Softness is faked with canvas shadow blur, since the tip files own
    // shape only and cannot feather themselves. At hardness 1 no shadow is
    // set at all, so the common case pays zero cost. Max blur is capped as
    // a fraction of brush width so a soft edge stays proportional.
    const MAX_BLUR_RATIO = 0.5;

    // Used when a brush module somehow holds a non-finite value. Canvas
    // ignores NaN assignments silently, so without these the stroke would
    // render at stale settings with no signal that anything is wrong.
    const SAFE_OPACITY = 1;
    const SAFE_HARDNESS = 1;

    // strokeState is the { lastX, lastY } object returned by strokeStart.
    // Returns an updated { lastX, lastY } to pass into the next call,
    // or null if the stroke cannot continue.
    export function strokeMove(canvasRef, x, y, strokeState, shape = "round", color = FALLBACK_COLOR) {
      if (!canvasRef || !canvasRef.current) return null;
        if (!strokeState) return null;
          if (!Number.isFinite(x) || !Number.isFinite(y)) return strokeState;

            const { lastX, lastY } = strokeState;
              if (!Number.isFinite(lastX) || !Number.isFinite(lastY)) return { lastX: x, lastY: y };

                const ctx = canvasRef.current.getContext("2d");
                  if (!ctx) return null;

                    // brushSize is clamped at its own module, but a stale import or a
                      // future writer bypassing the setter would put NaN into every dab
                        // and silently draw nothing. Cheap to rule out here.
                          if (!Number.isFinite(brushSize) || brushSize <= 0) return { lastX: x, lastY: y };

                            // Same reasoning as brushSize above, applied consistently.
                              const opacity = Number.isFinite(brushOpacity) ? brushOpacity : SAFE_OPACITY;
                                const hardness = Number.isFinite(brushHardness) ? brushHardness : SAFE_HARDNESS;

                                  const drawTip = TIPS[shape] || TIPS.round;

                                    // The default parameter above only fires on undefined. null or ""
                                      // would slip through and set an invalid fillStyle, which canvas
                                        // silently ignores - dabs would render in a stale color.
                                          const fill = color || FALLBACK_COLOR;

                                            const dx = x - lastX;
                                              const dy = y - lastY;
                                                const distance = Math.hypot(dx, dy);

                                                  const blur = (1 - hardness) * brushSize * MAX_BLUR_RATIO;
                                                    const maxDabs = blur > 0 ? MAX_DABS_PER_MOVE_BLURRED : MAX_DABS_PER_MOVE;

                                                      const spacing = Math.max(1, brushSize * SPACING_RATIO);
                                                        const steps = Math.min(maxDabs, Math.ceil(distance / spacing));

                                                          // save/restore covers alpha, fillStyle and shadow state in one pair,
                                                            // so brush settings cannot leak into thumbnails, onion skinning, or
                                                              // any later draw on this shared context. try/finally guarantees the
                                                                // restore even if a tip throws - manual property restore would be
                                                                  // skipped on throw and leave the context permanently blurred.
                                                                    ctx.save();
                                                                      try {
                                                                          ctx.globalAlpha = opacity;
                                                                              ctx.fillStyle = fill;

                                                                                  if (blur > 0) {
                                                                                        ctx.shadowBlur = blur;
                                                                                              ctx.shadowColor = fill;
                                                                                                  }

                                                                                                      if (steps <= 0) {
                                                                                                            // No movement since last sample - stamp once so a stationary
                                                                                                                  // finger still marks the canvas.
                                                                                                                        drawTip(ctx, x, y, brushSize);
                                                                                                                            } else {
                                                                                                                                  // Interpolate between the previous point and this one, otherwise
                                                                                                                                        // fast drags produce spaced dots instead of a continuous stroke.
                                                                                                                                              for (let i = 1; i <= steps; i++) {
                                                                                                                                                      const t = i / steps;
                                                                                                                                                              drawTip(ctx, lastX + dx * t, lastY + dy * t, brushSize);
                                                                                                                                                                    }
                                                                                                                                                                        }
                                                                                                                                                                          } finally {
                                                                                                                                                                              ctx.restore();
                                                                                                                                                                                }

                                                                                                                                                                                  return { lastX: x, lastY: y };
                                                                                                                                                                                  }