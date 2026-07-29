import { pushSnapshot } from "../../shared/undoRedo/historyStack.js";

// Handles finalizing a stroke only - saves it to undo history.
//
// Contract:
//   canvasRef - React ref to the <canvas> element
//   didDraw   - pass false when strokeStart returned null or the
//               stroke drew nothing, so an empty pointer-up does not
//               burn an undo slot on a duplicate snapshot
//
// Call exactly once per stroke, on pointer-up. Returns true if a
// snapshot was pushed, false otherwise.
//
// COST WARNING: toDataURL is synchronous and encodes the whole canvas
// to PNG, then base64. Roughly 50-150ms blocking on a phone and a
// multi-megabyte string per stroke. Check this before raising history
// depth.

// toDataURL returns this exact string when the canvas has zero width
// or height. It is truthy, so a plain falsy check lets it through -
// and undoing to it would blank the canvas.
const EMPTY_CANVAS_DATA_URL = "data:,";

export function strokeEnd(canvasRef, didDraw = true) {
  if (!didDraw) return false;
    if (!canvasRef || !canvasRef.current) return false;

      try {
          // toDataURL throws SecurityError on a canvas tainted by a
              // cross-origin image; pushSnapshot can throw on storage pressure.
                  // Either escaping would kill the pointer-up handler.
                      const snapshot = canvasRef.current.toDataURL();
                          if (snapshot === EMPTY_CANVAS_DATA_URL) return false;

                              pushSnapshot(snapshot);
                                  return true;
                                    } catch {
                                        return false;
                                          }
                                          }