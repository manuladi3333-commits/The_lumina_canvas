// Removes a layer by id only.

// The canvas needs at least one layer to draw on. Removing the last
// one leaves no draw target, which reads as a dead brush rather than
// an error. The caller should clear the layer's imageData instead of
// calling this - clearing is not handled here.
export const MIN_LAYERS = 1;

// Returns a NEW array on success.
//
// Returns the SAME array reference when nothing was removed - the id
// was not found or the list is at MIN_LAYERS. The caller's
// setLayers() is then a no-op and React skips the re-render.
// Compare by reference to detect this and show a message.
//
// Returns a new EMPTY array if the input is not an array, matching
// layerAdd. Returning the invalid input would hand undefined to
// setLayers and crash the next render.
export function layerRemove(layersList, layerId) {
  if (!Array.isArray(layersList)) return [];
    if (layersList.length <= MIN_LAYERS) return layersList;

      // A missing id must match nothing. Comparing it directly would let
        // undefined equal the undefined id of a malformed entry and delete
          // that entry instead - a wrong removal reported as a success.
            if (typeof layerId !== "string" || !layerId) return layersList;

              // findIndex tests for the id itself, rather than inferring "not
                // found" from an unchanged length. It also stops at the first
                  // match, so a duplicate id can never remove two layers at once.
                    const index = layersList.findIndex((layer) => layer?.id === layerId);
                      if (index === -1) return layersList;

                        return [...layersList.slice(0, index), ...layersList.slice(index + 1)];
                        }