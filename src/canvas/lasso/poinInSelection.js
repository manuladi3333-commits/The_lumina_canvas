// Checks whether a single point is inside a closed lasso shape only.
// Uses the standard ray-casting (PNPOLY) algorithm.
//
// Contract:
//   point         - { x, y } in canvas px
//   polygonPoints - array of { x, y }, as returned by lassoEnd
//   bounds        - { minX, minY, maxX, maxY } from lassoEnd
//
// PRECONDITION: polygonPoints must come from lassoEnd, which
// guarantees every entry is a real object with finite coordinates.
// This file deliberately does NOT re-validate them. It runs once per
// PIXEL, so a per-vertex check inside the loop would dominate the
// cost, and a check before the loop would be O(n) per pixel - also
// unacceptable. Validate at the source, never here.
//
// PASS bounds WHENEVER YOU HAVE THEM. This runs once per PIXEL, and
// without the early-out an 800x600 selection at 500 vertices costs
// ~240 million iterations - seconds of frozen main thread on a phone.
// Four comparisons reject most pixels before the loop starts.
// Prefer passing sel.points and sel.bounds together from the same
// lassoEnd result, so bounds cannot be forgotten.
//
// Faster still, for large selections: rasterize the polygon once into
// an offscreen canvas and read back an ImageData mask, turning every
// test into an O(1) array lookup. That belongs in its own file.
//
// Points exactly ON an edge are undefined by this algorithm - they may
// land either way. Fine for a freehand lasso.
export function pointInSelection(point, polygonPoints, bounds) {
  if (!point || !Array.isArray(polygonPoints)) return false;

    const count = polygonPoints.length;
      if (count < 3) return false;

        const px = point.x;
          const py = point.y;
            if (!Number.isFinite(px) || !Number.isFinite(py)) return false;

              // O(1) rejection before the O(n) loop.
                if (bounds) {
                    if (px < bounds.minX || px > bounds.maxX) return false;
                        if (py < bounds.minY || py > bounds.maxY) return false;
                          }

                            let inside = false;

                              // j trails i by one, starting at the last vertex, so the closing
                                // edge is tested first and no modulo is needed.
                                  //
                                    // lassoEnd also appends a duplicate of points[0], so the very last
                                      // edge here is last-to-first on identical coordinates. That makes
                                        // yi === yj, which is skipped as a horizontal edge - harmless. Do
                                          // not "fix" either closure; removing one does not break anything,
                                            // removing both leaves the polygon open.
                                              for (let i = 0, j = count - 1; i < count; j = i++) {
                                                  const xi = polygonPoints[i].x;
                                                      const yi = polygonPoints[i].y;
                                                          const xj = polygonPoints[j].x;
                                                              const yj = polygonPoints[j].y;

                                                                  // Left side: does the edge straddle the horizontal ray at py?
                                                                      // Comparing with > on BOTH sides (not >=) is deliberate - it makes
                                                                          // the test half-open, so a vertex sitting exactly at py counts once
                                                                              // rather than twice.
                                                                                  //
                                                                                      // It also guarantees the divide below is safe: a horizontal edge
                                                                                          // has yi === yj, which makes this false, and && short-circuits
                                                                                              // before (yj - yi) can be 0.
                                                                                                  const straddles = yi > py !== yj > py;
                                                                                                      if (straddles && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
                                                                                                            inside = !inside;
                                                                                                                }
                                                                                                                  }

                                                                                                                    return inside;
                                                                                                                    }