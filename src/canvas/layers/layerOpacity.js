// Sets a layer's opacity by id only. Named ...Set so a call site
// reads as an action, alongside layerAdd/layerRemove/layerReorder.

// Shared with the other layer files: returns a NEW array on success
// with only the matched layer replaced (siblings keep their refs, so
// memoized rows skip re-render); the SAME array when nothing changed,
// making setLayers a no-op; a new EMPTY array on invalid input.
// imageData is copied by REFERENCE - never deep-clone it.

// 0-1 scale, matching brushOpacity.js. Exported so the slider clamps
// against the same limits. LAYER_OPACITY_DEFAULT stays in layerAdd.js.
export const LAYER_OPACITY_MIN = 0;
export const LAYER_OPACITY_MAX = 1;

export function layerOpacitySet(layersList, layerId, newOpacity) {
  if (!Array.isArray(layersList)) return [];

    // A non-empty string id cannot match a malformed entry's undefined
      // id, which also makes target.opacity below safe to read.
        if (typeof layerId !== "string" || !layerId) return layersList;

          // Sliders emit strings, so coercion is required - but Number(null),
            // Number("") and Number([]) are all 0, which would pass the finite
              // check and silently hide the layer. Reject non-numeric types first.
                if (typeof newOpacity !== "number" && typeof newOpacity !== "string") return layersList;

                  const parsed = Number(newOpacity);
                    if (!Number.isFinite(parsed) || newOpacity === "") return layersList;

                      const opacity = Math.min(LAYER_OPACITY_MAX, Math.max(LAYER_OPACITY_MIN, parsed));

                        // Miss returns the original, so a stale tap does not re-render the
                          // panel - which at slider-drag frequency is once per frame.
                            const index = layersList.findIndex((layer) => layer?.id === layerId);
                              if (index === -1) return layersList;

                                const target = layersList[index];
                                  if (target.opacity === opacity) return layersList;

                                    const updated = [...layersList];
                                      updated[index] = { ...target, opacity };
                                        return updated;
                                        }