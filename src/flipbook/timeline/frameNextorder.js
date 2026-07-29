// Owns the next-order rule only.

// order is playback position and half of the [characterId+order]
// compound key. Array length repeats a value after a delete, and
// original.order + 1 reuses the next frame's order - either way
// frameSave finds one row for two frames and overwrites one with the
// other. Continue past the highest order actually present.
// Gaps are harmless; only ordering matters for playback.
//
// Shared by frameAdd and frameDuplicate. It encodes a storage-key
// constraint, so it must exist in exactly one place.
export function frameNextOrder(framesList) {
  if (!Array.isArray(framesList)) return 0;

    let highest = -1;

      for (const frame of framesList) {
          if (Number.isInteger(frame?.order) && frame.order > highest) {
                highest = frame.order;
                    }
                      }

                        return highest + 1;
                        }