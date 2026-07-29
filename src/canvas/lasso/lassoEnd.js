// Handles closing the lasso loop only.
//
// Returns a NEW { points, closed, bounds } object - the original
// gesture state is left alone. This is where the mutation rule FLIPS:
// lassoMove mutates because it runs ~60 times a second, this runs
// once per gesture, so the finished selection is immutable and safe
// to hold in useState.
//
// Returns null if there is no usable selection - bad state, too few
// vertices, or a shape too small to enclose anything. The caller
// should treat null as "no selection made" and leave the previous
// selection untouched.

// A polygon needs three distinct vertices to enclose any area. One or
// two close into a zero-area shape that reports closed: true and then
// selects nothing, with no error visible on a phone.
const MIN_LASSO_POINTS = 3;

// Three vertices are necessary but not sufficient: a straight swipe
// yields dozens of COLLINEAR points, which close into a zero-area
// sliver and fail exactly the same silent way. Require the bounding
// box to have real extent in both axes.
const MIN_LASSO_SPAN = 3;

export function lassoEnd(selectionState) {
  if (!selectionState || !Array.isArray(selectionState.points)) return null;

    const { points } = selectionState;
      if (points.length < MIN_LASSO_POINTS) return null;

        const first = points[0];
          if (!first || !Number.isFinite(first.x) || !Number.isFinite(first.y)) return null;

            // One O(n) pass, run once per gesture. Bounds are returned rather
              // than discarded because hit testing runs per-PIXEL and would
                // otherwise recompute this every time.
                  let minX = first.x;
                    let maxX = first.x;
                      let minY = first.y;
                        let maxY = first.y;

                          for (const point of points) {
                              if (point.x < minX) minX = point.x;
                                  if (point.x > maxX) maxX = point.x;
                                      if (point.y < minY) minY = point.y;
                                          if (point.y > maxY) maxY = point.y;
                                            }

                                              // Rejects a straight swipe or a tremor-tap: real in one axis,
                                                // effectively zero in the other.
                                                  if (maxX - minX < MIN_LASSO_SPAN || maxY - minY < MIN_LASSO_SPAN) return null;

                                                    // Copy, do not alias. Appending `first` itself would put the SAME
                                                      // object at both ends, so anything mutating one vertex would silently
                                                        // move the other - and lassoMove does mutate a point in place at its
                                                          // cap.
                                                            const closingPoint = { x: first.x, y: first.y };

                                                              return {
                                                                  points: [...points, closingPoint],
                                                                      closed: true,
                                                                          bounds: { minX, minY, maxX, maxY },
                                                                            };
                                                                            }