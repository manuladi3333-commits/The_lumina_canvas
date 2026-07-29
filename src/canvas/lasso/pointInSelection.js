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
    if (selectionState.points.length < MIN_LASSO_POINTS) return null;

      // One pass, once per gesture: validate and collect bounds together.
        //
          // Validating here is not redundant with lassoStart/lassoMove. A null
            // entry would throw on point.x below, and a NaN coordinate is
              // INVISIBLE to the comparisons - both < and > are false against NaN -
                // so it would pass the span check and still poison every hit test.
                  //
                    // Bounds are returned rather than discarded because hit testing runs
                      // per-PIXEL and would otherwise recompute this every time.
                        const points = [];
                          let minX = Infinity;
                            let maxX = -Infinity;
                              let minY = Infinity;
                                let maxY = -Infinity;

                                  for (const point of selectionState.points) {
                                      if (!point) continue;
                                          const { x, y } = point;
                                              if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

                                                  if (x < minX) minX = x;
                                                      if (x > maxX) maxX = x;
                                                          if (y < minY) minY = y;
                                                              if (y > maxY) maxY = y;

                                                                  // Copy every vertex. lassoMove mutates a point in place at its
                                                                      // cap, so holding its objects would let a later gesture reshape
                                                                          // a finished selection.
                                                                              points.push({ x, y });
                                                                                }

                                                                                  // Re-checked against the SURVIVING count, not the input count.
                                                                                    if (points.length < MIN_LASSO_POINTS) return null;

                                                                                      // Rejects a straight swipe or a tremor-tap: real in one axis,
                                                                                        // effectively zero in the other.
                                                                                          if (maxX - minX < MIN_LASSO_SPAN || maxY - minY < MIN_LASSO_SPAN) return null;

                                                                                            // Close the loop with a separate object, never an alias of points[0].
                                                                                              points.push({ x: points[0].x, y: points[0].y });

                                                                                                // Always true on a successful return. Kept so a renderer can tell a
                                                                                                  // finished polygon from live lassoMove state by shape alone, without
                                                                                                    // knowing which file produced the object.
                                                                                                      return { points, closed: true, bounds: { minX, minY, maxX, maxY } };
                                                                                                      }