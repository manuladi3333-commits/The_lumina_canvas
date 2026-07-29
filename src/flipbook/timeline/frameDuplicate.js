import { MAX_FRAMES } from "./frameAdd.js";
import { frameNextOrder } from "./frameNextOrder.js";

// Duplicates an existing frame by id only.

// Own counters, and "d" markers, so ids from here can never collide
// with ones from frameAdd or layerAdd in the same millisecond.
let duplicateCounter = 0;
let layerCopyCounter = 0;

// Deep-copies one layer. The ImageData buffer MUST be copied: canvas
// drawing writes into it in place, so a shared buffer means drawing
// on the duplicate silently alters the original.
//
// The layer id MUST be regenerated. Spreading the original carries
// its id across, so two frames would hold layers with identical ids -
// breaking the app-wide uniqueness layerAdd exists to provide. It
// looks harmless while one frame renders at a time, and breaks the
// moment onion skinning draws two frames together.
function copyLayer(layer) {
  if (!layer) return layer;

    const freshId = `layer-${Date.now()}-d${layerCopyCounter++}`;
      const source = layer.imageData;

        if (typeof ImageData === "undefined" || !(source instanceof ImageData)) {
            // Nothing drawn yet, or an unconverted import - carry across as
                // is rather than guess. placeImportedImage documents that case.
                    return { ...layer, id: freshId };
                      }

                        return {
                            ...layer,
                                id: freshId,
                                    imageData: new ImageData(
                                          new Uint8ClampedArray(source.data),
                                                source.width,
                                                      source.height
                                                          ),
                                                            };
                                                            }

                                                            // Returns a NEW array with the copy appended.
                                                            //
                                                            // Returns the SAME array reference when nothing was duplicated - the
                                                            // id was not found, the id was invalid, the cap was reached, or the
                                                            // copy ran out of memory. The caller's setFrames() is then a no-op
                                                            // and React skips the re-render. Compare by reference to detect this
                                                            // and tell the user.
                                                            //
                                                            // Returns a new EMPTY array if the input is not an array, matching
                                                            // frameAdd, frameRemove and the layer files.
                                                            //
                                                            // COST: this copies every drawn layer's pixels - roughly 8MB per
                                                            // layer. A 3-layer frame is a ~25MB allocation on one tap, tens of
                                                            // milliseconds of blocked main thread. Unavoidable for a real
                                                            // duplicate, and the most expensive single action in the app - which
                                                            // is why it is the one place that can genuinely fail on allocation.
                                                            //
                                                            // The copy is APPENDED, with an order past the highest present - it
                                                            // does not land next to the original. Inserting adjacently would mean
                                                            // renumbering every later frame, and those orders are live storage
                                                            // keys in db.frames, so a renumber has to move the rows too. That
                                                            // belongs in a frameReorder file with persistence, alongside the
                                                            // frameRowDelete that frameRemove already defers to.
                                                            export function frameDuplicate(framesList, frameId) {
                                                              if (!Array.isArray(framesList)) return [];
                                                                if (framesList.length >= MAX_FRAMES) return framesList;

                                                                  // A missing id must match nothing. Comparing it directly would let
                                                                    // undefined equal the undefined id of a malformed entry and
                                                                      // duplicate that entry instead.
                                                                        if (typeof frameId !== "string" || !frameId) return framesList;

                                                                          const original = framesList.find((frame) => frame?.id === frameId);
                                                                            if (!original) return framesList;

                                                                              let layerData;
                                                                                try {
                                                                                    // new Uint8ClampedArray throws RangeError when the device cannot
                                                                                        // spare the buffer - a real prospect at 25MB on a phone already
                                                                                            // holding several frames. Uncaught, it kills the tap handler and
                                                                                                // the button silently stops working.
                                                                                                    layerData = Array.isArray(original.layerData)
                                                                                                          ? original.layerData.map(copyLayer)
                                                                                                                : [];
                                                                                                                  } catch {
                                                                                                                      return framesList;
                                                                                                                        }

                                                                                                                          const duplicated = {
                                                                                                                              ...original,
                                                                                                                                  // String with the frame- prefix, matching frameAdd. A raw number
                                                                                                                                      // fails frameRemove's string guard, which would leave the
                                                                                                                                          // duplicate permanently undeletable.
                                                                                                                                              id: `frame-${Date.now()}-d${duplicateCounter++}`,
                                                                                                                                                  order: frameNextOrder(framesList),
                                                                                                                                                      layerData,
                                                                                                                                                        };

                                                                                                                                                          return [...framesList, duplicated];
                                                                                                                                                          }