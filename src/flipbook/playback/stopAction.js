// Stops continuous playback only.
//
// TAKES THE STOP FUNCTION playAction returned - not an interval id.
// playAction uses requestAnimationFrame, so there is no timer to
// clear. Passing the old id here silently did nothing: clearInterval
// on a non-number matches no timer and never throws, so the pause
// button appeared dead while the rAF loop kept running.
//
//     const stop = playAction(advance);
//     ...
//     stopAction(stop);
//
// Returns true if a stop function was received and called, false if
// the argument was not one.
//
// NOTE: true does NOT mean playback was running. playAction's stop
// closure is idempotent, so a second call returns true having done
// nothing. Track playing/paused in the caller from whether a stop
// function is currently held, not from this return value.
//
// Safe to call more than once, and safe after playback already
// ended.
export function stopAction(stop) {
  if (typeof stop !== "function") return false;
    stop();
      return true;
      }