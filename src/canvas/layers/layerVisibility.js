// Toggles a layer's visibility by id only.
//
// Named ...Toggle, not ...Visibility, so a call site reads as an
// action like layerAdd/layerRemove/layerReorder. To SET visibility
// to a known value - restoring a saved project, or a solo/isolate
// action - add a separate layerVisibilitySet.js rather than reading
// state and calling this conditionally, which races on stale state.

// Returns a NEW array on success. Only the matched layer is a new
// object; every other entry keeps its original reference, so a
// memoized layer row does not re-render.
//
// Returns the SAME array reference when nothing changed - the id was
// not found or was not a valid id. The caller's setLayers() is then
// a no-op and React skips the re-render. Compare by reference to
// detect this, matching layerAdd, layerRemove and layerReorder.
//
// Returns a new EMPTY array if the input is not an array, matching
// the same three files.
//
// The spread copies imageData by REFERENCE, not by value, so this
// costs a pointer rather than a full-canvas buffer. Do not swap it
// for a deep clone.
export function layerVisibilityToggle(layersList, layerId) {
  if (!Array.isArray(layersList)) return [];

    // A missing id must match nothing. Comparing it directly would let
      // undefined equal the undefined id of a malformed entry and toggle
        // that entry instead.
          if (typeof layerId !== "string" || !layerId) return layersList;

            // Find first, so a miss returns the original array untouched.
              // Mapping unconditionally would hand setLayers a changed reference
                // on every miss and re-render the panel for nothing.
                  const index = layersList.findIndex((layer) => layer?.id === layerId);
                    if (index === -1) return layersList;

                      const target = layersList[index];
                        const updated = [...layersList];
                          updated[index] = { ...target, visible: !target.visible };

                            return updated;
                            }