// Adds a new layer to the list only.

// Date.now() alone collides when two layers are added in the same
// millisecond - a double-tap, a StrictMode double-invoke, or an
// "add 3 layers" loop. Duplicate ids mean duplicate React keys and
// delete/reorder hitting the wrong layer. The counter guarantees
// uniqueness within a session; the timestamp keeps ids unique
// against layers loaded from a previous session.
let layerCounter = 0;

export const LAYER_OPACITY_DEFAULT = 1;

// Each layer holds a full-canvas ImageData once drawn on - roughly
// 8MB at phone resolution. Combined with snapshot undo, an unbounded
// stack will get the tab killed by mobile Safari.
export const MAX_LAYERS = 12;

// Array length would repeat a name after a delete: removing Layer 2
// of 3 leaves ["Layer 1", "Layer 3"], and length + 1 gives "Layer 3"
// again. Continue from the highest number actually present instead.
function nextLayerName(layersList) {
  let highest = 0;

    for (const layer of layersList) {
        const match = /^Layer (\d+)$/.exec(layer?.name ?? "");
            if (match) highest = Math.max(highest, Number(match[1]));
              }

                return `Layer ${highest + 1}`;
                }

                // Returns a NEW array on success.
                //
                // Returns the SAME array reference when the cap is reached, so the
                // caller's setLayers() is a no-op and React skips the re-render.
                // Compare by reference to detect the cap and show a message.
                //
                // Returns a new EMPTY array if the input is not an array - this is
                // recovery from a corrupt list, not a no-op. Do not call with a
                // possibly-undefined list during an async load; it will wipe state.
                export function layerAdd(layersList) {
                  if (!Array.isArray(layersList)) return [];
                    if (layersList.length >= MAX_LAYERS) return layersList;

                      const newLayer = {
                          id: `layer-${Date.now()}-${layerCounter++}`,
                              name: nextLayerName(layersList),
                                  visible: true,
                                      opacity: LAYER_OPACITY_DEFAULT,
                                          imageData: null,
                                            };

                                              return [...layersList, newLayer];
                                              }