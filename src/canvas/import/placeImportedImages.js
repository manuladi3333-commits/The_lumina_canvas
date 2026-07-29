import { layerAdd } from "../layers/layerAdd.js";

// Places prepared image pixels onto a new layer only.
//
// Returns a NEW array with the image on a new top layer.
//
// Returns the SAME array reference when nothing was placed - no
// pixels, wrong type, or the layer cap was reached. The caller's
// setLayers() is then a no-op; compare by reference to detect it and
// tell the user why, since a silent nothing looks like a bug.
//
// Returns a new EMPTY array if layersList is not an array, matching
// the layer files.
//
// PASS AN ImageData, NOT AN HTMLImageElement.
//
// An element works for drawing but breaks two other things:
//   1. It is not structured-cloneable, so db.frames.put() throws
//      DataCloneError the first time a project with an import is
//      saved - failing at SAVE, long after the import looked fine.
//   2. It retains the full-resolution bitmap (~48MB for a 12MP
//      photo) for the whole session, which readImageFile explicitly
//      warns against. The canvas is a few hundred px wide and cannot
//      use that detail.
//
// Both are fixed upstream: draw the element to a canvas at fit-to-
// canvas size, getImageData, drop the element. That belongs in its
// own file - it needs the target dimensions, which this file has no
// business knowing. Until it exists, an element is accepted so the
// import path can be tested end to end.
//
// Placement geometry (x, y, scale) is NOT recorded here. Sizing the
// pixels to the canvas in that same upstream step avoids needing it.
export function placeImportedImage(layersList, img) {
  if (!Array.isArray(layersList)) return [];

    // readImageFile resolves null on an unsupported or failed decode.
      // The type check also rejects a File or a string passed by mistake,
        // which would otherwise become a layer that renders nothing.
          const usable =
              (typeof ImageData !== "undefined" && img instanceof ImageData) ||
                  (typeof HTMLImageElement !== "undefined" && img instanceof HTMLImageElement);
                    if (!usable) return layersList;

                      const updatedLayers = layerAdd(layersList);

                        // layerAdd returns the SAME reference when it hits MAX_LAYERS.
                          // Without this check the code below would target the existing top
                            // layer and overwrite the user's artwork with the import.
                              if (updatedLayers === layersList) return layersList;

                                const index = updatedLayers.length - 1;

                                  // Writing into updatedLayers in place is safe only because layerAdd
                                    // just built it with a spread - no other reference exists. The
                                      // ENTRY is still replaced rather than mutated, matching
                                        // layerVisibilityToggle and layerOpacitySet, so a memoized layer
                                          // row sees a changed reference and re-renders.
                                            updatedLayers[index] = { ...updatedLayers[index], imageData: img };

                                              return updatedLayers;
                                              }