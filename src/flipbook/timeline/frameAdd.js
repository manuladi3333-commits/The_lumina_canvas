import { layerAdd } from "../layers/layerAdd.js";
import { frameNextOrder } from "./frameNextOrder.js";

// Adds a new blank frame to the sequence only.

// Date.now() alone collides when two frames are added in the same
// millisecond - a double-tap, a StrictMode double-invoke, or an
// "add 3 frames" loop. Same reasoning as layerAdd.js.
let frameCounter = 0;

// A frame holds a whole layer stack (MAX_LAYERS at ~8MB each), so
// this is the larger version of the layer ceiling.
//
// 240 frames is 20 seconds at 12fps, but it is NOT a working memory
// limit: 240 frames holding drawn layers is gigabytes, and a mobile
// tab dies in the low hundreds of MB. The cap only bounds the list.
// Keeping the app alive requires holding layerData for the CURRENT
// frame only and loading the rest from db.frames on demand - see
// canvasStorage.js, which already keys frames by [characterId+order].
export const MAX_FRAMES = 240;

// Returns a NEW array on success.
//
// Returns the SAME array reference when the cap is reached, so the
// caller's setFrames() is a no-op and React skips the re-render.
// Compare by reference to detect it and tell the user.
//
// Returns a new EMPTY array if the input is not an array - recovery
// from a corrupt list, not a no-op. Matches the layer files.
//
// NOTE: this `id` is a CLIENT-SIDE key for React lists only. It is
// NOT the Dexie ++id of a row in the frames table, which is what
// projects.frameIds stores. The string prefix keeps the two from
// being mistaken for each other.
export function frameAdd(framesList) {
  if (!Array.isArray(framesList)) return [];
    if (framesList.length >= MAX_FRAMES) return framesList;

      const newFrame = {
          id: `frame-${Date.now()}-${frameCounter++}`,
              // Shared with frameDuplicate. The rule encodes a storage-key
                  // constraint, so it lives in exactly one file - see
                      // frameNextOrder.js for why length and order+1 both break it.
                          order: frameNextOrder(framesList),
                              // Seeded with one blank layer, not []. MIN_LAYERS is 1 because a
                                  // canvas with no layer has no draw target and reads as a dead
                                      // brush - a frame must not be born in the state layerRemove
                                          // refuses to create. Costs nothing: imageData starts null.
                                              layerData: layerAdd([]),
                                                };

                                                  return [...framesList, newFrame];
                                                  }