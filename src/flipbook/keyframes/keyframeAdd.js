// Marks a frame as a keyframe by id only.
//
// Returns a NEW array on success. Only the matched frame is a new
// object; every other entry keeps its reference, so a memoized
// timeline row does not re-render.
//
// Returns the SAME array reference when nothing changed - the id was
// not found, the id was invalid, or the frame is already a keyframe.
// The caller's setFrames() is then a no-op and React skips the
// re-render. Compare by reference to detect this, matching the layer
// and frame files.
//
// Returns a new EMPTY array if the input is not an array, matching
// the same files.
//
// NOT PERSISTED YET. frameSave writes an explicit field list -
// characterId, order, layerData, createdAt - and spreads nothing
// from the frame object, so isKeyframe is never written and never
// read back. Every mark is lost on reload.
//
// To fix, add one line to the put() in canvasStorage.js:
//     isKeyframe: Boolean(frame.isKeyframe),
// which means frameSave must take the frame, not just its layers.
//
// isKeyframe is also NOT an indexed field in the frames schema, so
// even once stored you cannot query "all keyframes" from Dexie
// without loading every frame. Scan in memory instead.
//
// SCOPE: with AI interpolation dropped, every frame is hand-drawn,
// so a keyframe is a BOOKMARK - it does not drive playback, export,
// or in-betweening. Nothing reads this field yet.
export function keyframeAdd(framesList, frameId) {
  if (!Array.isArray(framesList)) return [];

    // A missing id must match nothing. Comparing it directly would let
      // undefined equal the undefined id of a malformed entry and mark
        // that entry instead.
          if (typeof frameId !== "string" || !frameId) return framesList;

            // Find first, so a miss returns the original array untouched.
              // Mapping unconditionally would hand setFrames a changed reference
                // on every miss and re-render the whole timeline for nothing.
                  const index = framesList.findIndex((frame) => frame?.id === frameId);
                    if (index === -1) return framesList;

                      const target = framesList[index];
                        if (target.isKeyframe) return framesList;

                          const updated = [...framesList];
                            updated[index] = { ...target, isKeyframe: true };

                              return updated;
                              }