// Moves a frame from one position to another only.
//
// IN-MEMORY ONLY. This renumbers every frame's `order` so array
// position and order agree, but does NOT touch db.frames. Call
// frameOrderPersist(characterId, result) afterwards, or the reorder
// will not survive a reload.
//
// Why the rows cannot be moved from this file: after a renumber,
// frames sit on keys other rows already occupy. frameSave's
// existing-row lookup would find the OLD frame's row at that order,
// adopt its id, and bind one frame to another's storage. The row
// rewrite must land in ONE db transaction, which is async - that is
// what frameOrderPersist.js is for.
//
// CALLER OBLIGATION: pause autosave from the moment this is called
// until frameOrderPersist resolves. A frameSave firing in that
// window is exactly the overwrite described above.

// Both indices must be integers within the list. splice would
// otherwise accept them silently: a negative index counts from the
// end, so a findIndex miss of -1 moves the LAST frame instead of
// failing, and an out-of-range fromIndex removes nothing and then
// inserts undefined into the list.
function isValidIndex(value, length) {
  return Number.isInteger(value) && value >= 0 && value < length;
  }

  // Returns a NEW array on success, with every frame's `order`
  // renumbered 0..n-1 to match its new position.
  //
  // Returns the SAME array reference when nothing moved - either index
  // is invalid, or from and to are equal. The caller's setFrames() is
  // then a no-op and React skips the re-render. Compare by reference
  // to detect this.
  //
  // Returns a new EMPTY array if the input is not an array, matching
  // frameAdd, frameRemove and the layer files.
  //
  // toIndex is the destination in the list AFTER the frame is lifted
  // out, which is what drag-and-drop reports. Moving index 0 to index
  // 2 in a 3-frame list lands it last, not second.
  export function frameReorder(framesList, fromIndex, toIndex) {
    if (!Array.isArray(framesList)) return [];

      const { length } = framesList;
        if (!isValidIndex(fromIndex, length)) return framesList;
          if (!isValidIndex(toIndex, length)) return framesList;
            if (fromIndex === toIndex) return framesList;

              const moved = [...framesList];
                const [lifted] = moved.splice(fromIndex, 1);
                  moved.splice(toIndex, 0, lifted);

                    // Renumber so order === index. Every frame gets a replaced object,
                      // not a mutated one, so memoized timeline rows re-render.
                        // layerData carries across by REFERENCE - never deep-clone it here.
                          //
                            // previousOrder is what frameOrderPersist matches rows on:
                              // db.frames has no column for the client-side frame id, so the old
                                // order number is the only link back to the right row.
                                  return moved.map((frame, index) => ({
                                      ...frame,
                                          order: index,
                                              previousOrder: frame.order,
                                                }));
                                                }