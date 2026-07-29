import { db } from "./dbInit.js";

// Owns frame persistence - saving and loading canvas frames.
//
// Both functions NEVER reject. Save resolves true/false; load
// resolves an array. The caller is often a debounced autosave with
// no catch, and an unhandled rejection is invisible on a phone.
//
// After a false from frameSave, read lastSaveError() for a short
// reason string and show it on screen. A silent failure looks
// exactly like success.
//
// SIZE WARNING: a save writes the whole layer stack - about 8MB per
// drawn layer as raw ImageData. At a 2s autosave that is a multi-
// megabyte structured clone every 2 seconds, which blocks the main
// thread. Compress layers to WebP blobs before this becomes the
// app's storage ceiling.

// Keys reach this file from a URL query param, where they are
// strings. A compound index treats "3" and 3 as different keys, and
// SKIPS any record missing a key field entirely - so an unnormalized
// key writes a row this query can never find again. Normalize once,
// here, and write only the normalized numbers.
function normalizeKey(characterId, order) {
  // Type gate first: Number(""), Number(null), Number([]) and
    // Number(false) are all 0, which IS an integer. An empty ?project=
      // param would otherwise resolve to frame [0, 0] and write there -
        // a valid-looking key, so nothing downstream ever notices.
          if (!isKeyish(characterId) || !isKeyish(order)) return null;

            const id = Number(characterId);
              const ord = Number(order);
                if (!Number.isInteger(id) || !Number.isInteger(ord)) return null;
                  return { id, ord };
                  }

                  function isKeyish(value) {
                    if (typeof value === "number") return true;
                      return typeof value === "string" && value.trim() !== "";
                      }

                      // True if any layer actually holds pixels. Used to tell a real frame
                      // from a freshly-initialised one.
                      function hasPixels(layersList) {
                        return layersList.some((layer) => layer?.imageData);
                        }

                        // Set on every failed save, cleared on every success. Read it to
                        // build on-screen status text; there is no dev console on mobile.
                        //
                        // Global, so a concurrent success can clear an error the user never
                        // saw. Acceptable while saves are debounced to one at a time - if
                        // manual and auto saves ever overlap, return the reason from
                        // frameSave instead of stashing it here.
                        let saveError = "";
                        export function lastSaveError() {
                          return saveError;
                          }

                          // Resolves true on success, false on failure.
                          //
                          // allowClear guards against the autosave race: a debounced save can
                          // fire before frameLoad has populated state, and the blank starter
                          // stack would then overwrite real work permanently. Pass true only
                          // from a deliberate user action such as Clear.
                          export async function frameSave(characterId, order, layersList, allowClear = false) {
                            const key = normalizeKey(characterId, order);
                              if (!key) {
                                  saveError = "Invalid frame key";
                                      return false;
                                        }
                                          if (!Array.isArray(layersList)) {
                                              saveError = "Invalid layer data";
                                                  return false;
                                                    }

                                                      try {
                                                          let refused = false;

                                                              // Read and write in one transaction. Without the id lookup, put()
                                                                  // on a ++id table has no key to match and INSERTS every time, so
                                                                      // saves pile up as duplicate rows and frameLoad returns the
                                                                          // oldest one - work that never comes back.
                                                                              await db.transaction("rw", db.frames, async () => {
                                                                                    const existing = await db.frames
                                                                                            .where("[characterId+order]")
                                                                                                    .equals([key.id, key.ord])
                                                                                                            .first();

                                                                                                                  // Refuse to blank a frame that currently holds work.
                                                                                                                        //
                                                                                                                              // Tests for PIXELS, not layer count. MIN_LAYERS is 1, so the
                                                                                                                                    // dangerous state is not an empty array - it is a single blank
                                                                                                                                          // starter layer created before frameLoad resolved. A count
                                                                                                                                                // check misses exactly the case that destroys a frame.
                                                                                                                                                      //
                                                                                                                                                            // This also covers a frameLoad read failure, which returns []
                                                                                                                                                                  // and leads to the same blank starter stack.
                                                                                                                                                                        if (!allowClear && !hasPixels(layersList) && existing?.layerData?.some((l) => l?.imageData)) {
                                                                                                                                                                                refused = true;
                                                                                                                                                                                        return;
                                                                                                                                                                                              }

                                                                                                                                                                                                    await db.frames.put({
                                                                                                                                                                                                            ...(existing ? { id: existing.id } : {}),
                                                                                                                                                                                                                    characterId: key.id,
                                                                                                                                                                                                                            order: key.ord,
                                                                                                                                                                                                                                    layerData: layersList,
                                                                                                                                                                                                                                            // Keep the original creation time; only new frames get now.
                                                                                                                                                                                                                                                    createdAt: existing?.createdAt ?? Date.now(),
                                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                                              });

                                                                                                                                                                                                                                                                  if (refused) {
                                                                                                                                                                                                                                                                        saveError = "Skipped blank save over an existing frame";
                                                                                                                                                                                                                                                                              return false;
                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                      saveError = "";
                                                                                                                                                                                                                                                                                          return true;
                                                                                                                                                                                                                                                                                            } catch (err) {
                                                                                                                                                                                                                                                                                                // DataCloneError means a layer holds something not structured-
                                                                                                                                                                                                                                                                                                    // cloneable, usually an HTMLImageElement from an import that was
                                                                                                                                                                                                                                                                                                        // never converted to ImageData.
                                                                                                                                                                                                                                                                                                            if (err?.name === "DataCloneError") {
                                                                                                                                                                                                                                                                                                                  saveError = "Layer holds an un-saveable image - convert imports to ImageData";
                                                                                                                                                                                                                                                                                                                      } else if (err?.name === "QuotaExceededError") {
                                                                                                                                                                                                                                                                                                                            saveError = "Device storage is full - free space or delete old projects";
                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                      saveError = "Save failed - could not write to storage";
                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                              return false;
                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                                                                // Resolves with the layers array, or [] if there is nothing to load
                                                                                                                                                                                                                                                                                                                                                // or the read failed.
                                                                                                                                                                                                                                                                                                                                                //
                                                                                                                                                                                                                                                                                                                                                // [] is ambiguous by design - "no frame yet" and "read failed" both
                                                                                                                                                                                                                                                                                                                                                // produce it, and both mean "start from an empty canvas". The blank
                                                                                                                                                                                                                                                                                                                                                // stack that follows is prevented from overwriting the real frame by
                                                                                                                                                                                                                                                                                                                                                // the hasPixels check in frameSave.
                                                                                                                                                                                                                                                                                                                                                export async function frameLoad(characterId, order) {
                                                                                                                                                                                                                                                                                                                                                  const key = normalizeKey(characterId, order);
                                                                                                                                                                                                                                                                                                                                                    if (!key) return [];

                                                                                                                                                                                                                                                                                                                                                      try {
                                                                                                                                                                                                                                                                                                                                                          const frame = await db.frames
                                                                                                                                                                                                                                                                                                                                                                .where("[characterId+order]")
                                                                                                                                                                                                                                                                                                                                                                      .equals([key.id, key.ord])
                                                                                                                                                                                                                                                                                                                                                                            .first();

                                                                                                                                                                                                                                                                                                                                                                                // layerData may be missing on a row written by an older version.
                                                                                                                                                                                                                                                                                                                                                                                    return Array.isArray(frame?.layerData) ? frame.layerData : [];
                                                                                                                                                                                                                                                                                                                                                                                      } catch {
                                                                                                                                                                                                                                                                                                                                                                                          return [];
                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                            }