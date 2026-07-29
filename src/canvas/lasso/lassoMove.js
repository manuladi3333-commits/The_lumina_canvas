// Handles adding points while dragging the lasso outline only.
//
// MUTATES selectionState.points in place and returns the SAME object,
// as lassoStart requires. Do not spread a copy: at ~60 calls/second
// that allocates a fresh array of the full current length each time,
// and the resulting GC pauses are what makes an outline lag a finger.
// Hold the returned object in a useRef, never useState.
//
// Returns the same selectionState, or null if it is unusable - in
// which case the caller should abandon the gesture.

// Sub-pixel samples add vertices without adding shape. Skipping them
// cuts the point count several-fold, which pays off again in every
// point-in-polygon test later. Squared to avoid a sqrt per event.
//
// This is in CANVAS px, not screen px. Once pinch-zoom exists, divide
// it by the zoom factor or the filter over-skips when zoomed out and
// stops filtering at all when zoomed in.
const MIN_POINT_DISTANCE_SQ = 2 * 2;

// Hard ceiling on vertex count. Past this the outline stops gaining
// detail, but must keep tracking the finger - see the cap branch.
const MAX_LASSO_POINTS = 5000;

export function lassoMove(selectionState, x, y) {
  if (!selectionState || !Array.isArray(selectionState.points)) return null;

    // lassoStart guards these because one NaN vertex makes the polygon
      // bounds NaN and every hit test false - a selection that silently
        // selects nothing. This file adds nearly all the vertices, so the
          // same guard belongs here.
            if (!Number.isFinite(x) || !Number.isFinite(y)) return selectionState;

              const { points } = selectionState;

                // At the cap, move the last vertex instead of discarding the sample.
                  // Dropping it would freeze the outline while the finger kept going,
                    // and the polygon would then close from a stale position - selecting
                      // a region the user never drew.
                        if (points.length >= MAX_LASSO_POINTS) {
                            const end = points[points.length - 1];
                                if (end) {
                                      end.x = x;
                                            end.y = y;
                                                }
                                                    return selectionState;
                                                      }

                                                        const last = points[points.length - 1];
                                                          if (last) {
                                                              const dx = x - last.x;
                                                                  const dy = y - last.y;
                                                                      if (dx * dx + dy * dy < MIN_POINT_DISTANCE_SQ) return selectionState;
                                                                        }

                                                                          points.push({ x, y });
                                                                            return selectionState;
                                                                            }