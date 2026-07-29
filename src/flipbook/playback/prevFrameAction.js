// Moves one frame backward only, with wraparound.
//
// Returns the previous index, wrapping from 0 back to the last frame.
//
// Returns 0 for any unusable input - a zero or negative frame count,
// or a non-integer index or count. 0 is always a valid index when
// frames exist, and jumping to the first frame is the least
// confusing recovery on a phone with no console.
//
// Mirror of nextFrameAction: same guards, same recovery value, same
// true-modulo form. The two are a matched pair - change one and
// change the other.
//
// 0 IS AMBIGUOUS BY DESIGN, though less so than in nextFrameAction:
// here it means either a normal step back from index 1, a
// single-frame list holding, or invalid input. Never a wrap - a wrap
// backward lands on the LAST index. A caller needing to detect a
// backward wrap can test (result > current).
//
// LOOPING VARIANT, matching nextFrameAction. A play-once rewind that
// stops at frame 0 rather than jumping to the end belongs in its own
// file (prevFrameActionOnce.js), not a flag here.
export function prevFrameAction(currentIndex, totalFrames) {
  // 1 % 0 is NaN, and a NaN index makes every frame lookup return
    // undefined - playback renders nothing, with no error.
      if (!Number.isInteger(totalFrames) || totalFrames <= 0) return 0;
        if (!Number.isInteger(currentIndex)) return 0;

          const previous = currentIndex - 1;

            // JavaScript's % keeps the sign of the dividend, so a negative
              // index stays negative instead of wrapping into range. Adding
                // totalFrames once only fixes a step from index 0 - a corrupt
                  // index of -3 would still come out negative. The double modulo
                    // handles any value, matching nextFrameAction.
                      return ((previous % totalFrames) + totalFrames) % totalFrames;
                      }