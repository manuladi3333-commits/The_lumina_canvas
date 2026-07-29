// Unmarks a frame as a keyframe by id only.
//
// Mirror of keyframeAdd - same guards, same return contract. Kept as
// a separate file so each owns one direction, matching frameAdd and
// frameRemove.
//
// Returns a NEW array on success, the SAME array reference when
// nothing changed (id not found, id invalid, or not currently a
// keyframe), and a new EMPTY array if the input is not an array.
//
// Sets isKeyframe to false rather than deleting the key, so the
// field is always present and frameSave can write it unconditionally
// once persistence is wired up.
export function keyframeRemove(framesList, frameId) {
  if (!Array.isArray(framesList)) return [];
    if (typeof frameId !== "string" || !frameId) return framesList;

      const index = framesList.findIndex((frame) => frame?.id === frameId);
        if (index === -1) return framesList;

          const target = framesList[index];
            if (!target.isKeyframe) return framesList;

              const updated = [...framesList];
                updated[index] = { ...target, isKeyframe: false };

                  return updated;
                  }