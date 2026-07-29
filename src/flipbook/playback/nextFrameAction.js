// Advances one frame forward only, with wraparound.
//
// Returns the next index, wrapping from the last frame back to 0.
//
// Returns 0 for any unusable input - a zero or negative frame count,
// or a non-integer index or count. 0 is always a valid index when
// frames exist, and playback restarting from the first frame is the
// least confusing recovery on a phone with no console.
//
// 0 IS AMBIGUOUS BY DESIGN. It means all three of: wrapped from the
// last frame, single-frame list holding, and invalid input. A caller
// that needs to react to a completed loop - stop after N loops, or
// update a loop counter - cannot tell them apart from this value.
// Detect the wrap at the call site with (next === 0 && current > 0),
// or put that test in its own frameDidWrap.js. Not a second export
// here; this file returns one index and nothing else.
//
// LOOPING VARIANT. Play-once-and-stop needs different behaviour at
// the end - stop rather than wrap - so it belongs in its own file
// (nextFrameActionOnce.js), not a flag here.
export function nextFrameAction(currentIndex, totalFrames) {
  // 1 % 0 is NaN, and a NaN index makes every frame lookup return
    // undefined - playback renders nothing, with no error.
      if (!Number.isInteger(totalFrames) || totalFrames <= 0) return 0;
        if (!Number.isInteger(currentIndex)) return 0;

          const next = currentIndex + 1;

            // JavaScript's % keeps the sign of the dividend, so a negative
              // index stays negative instead of wrapping into range. Adding
                // totalFrames before the second modulo makes it a true modulo.
                  return ((next % totalFrames) + totalFrames) % totalFrames;
                  }