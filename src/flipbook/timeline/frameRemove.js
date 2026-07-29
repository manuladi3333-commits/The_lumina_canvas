// Removes a frame by id only.

// The canvas needs at least one frame to draw on. Removing the last
// one leaves no frame, so no layer stack, so no draw target - the
// same dead-canvas state MIN_LAYERS prevents, one level up.
//
// At the floor, this returns the same reference and the frame stays.
// The caller should route to a frameClear.js instead - reset the
// frame's layerData to a single blank layer, exactly as frameAdd
// seeds a new frame. That file does not exist yet; layerRemove has
// the identical open gap at MIN_LAYERS.
export const MIN_FRAMES = 1;

// Returns a NEW array on success.
//
// Returns the SAME array reference when nothing was removed - the id
// was not found, the id was invalid, or the list is at MIN_FRAMES.
// The caller's setFrames() is then a no-op and React skips the
// re-render. Compare by reference to detect this and tell the user.
//
// Returns a new EMPTY array if the input is not an array, matching
// frameAdd and the layer files.
//
// DESTRUCTIVE AND NOT UNDOABLE. historyStack snapshots canvas pixels,
// not the frame list, so a removed frame cannot be brought back.
// Confirm before calling.
//
// IN-MEMORY ONLY. The frame's row in db.frames, keyed by
// [characterId+order], is NOT deleted and still holds a full layer
// stack - megabytes per orphan, accumulating for the project's life.
// projects.frameIds also still references it. Deleting the row is
// async, which would change this function's shape, so it belongs in
// its own file. Call that alongside this one.
//
// The orphan is also a KEY hazard, not just wasted space. Its
// [characterId+order] entry survives on the freed order number.
// frameAdd never reuses that number, so nothing collides today - but
// any future reorder or renumber that reassigns it would make
// frameSave find the orphan, adopt its row id, and silently bind a
// new frame to the deleted one's storage.
export function frameRemove(framesList, frameId) {
  if (!Array.isArray(framesList)) return [];
    if (framesList.length <= MIN_FRAMES) return framesList;

      // A missing id must match nothing. Comparing it directly would let
        // undefined equal the undefined id of a malformed entry and delete
          // that entry instead - a wrong removal reported as a success.
            if (typeof frameId !== "string" || !frameId) return framesList;

              // findIndex tests for the id itself rather than inferring "not
                // found" from an unchanged length, and stops at the first match so
                  // a duplicate id can never remove two frames at once.
                    const index = framesList.findIndex((frame) => frame?.id === frameId);
                      if (index === -1) return framesList;

                        return [...framesList.slice(0, index), ...framesList.slice(index + 1)];
                        }

                        // Where the selection should land after frameRemove succeeds.
                        //
                        // Separate from frameRemove because that function returns only the
                        // new array, and re-deriving the position afterwards is impossible -
                        // the id it would search for no longer exists.
                        //
                        // Pass the index the removed frame occupied and the NEW list length.
                        // Returns the index to select: the frame that shifted into the gap,
                        // or the new last frame if the end was removed.
                        export function frameIndexAfterRemove(removedIndex, newLength) {
                          if (!Number.isInteger(removedIndex) || !Number.isInteger(newLength)) return 0;
                            if (newLength <= 0) return 0;
                              return Math.min(Math.max(removedIndex, 0), newLength - 1);
                              }