import { frameIntervalMs } from "../timeline/fpsSetting.js";

// Starts continuous playback only.
//
// CHECK THIS IMPORT PATH against your actual file. The fps module was
// reviewed as fps.js; if that is its name, this line must read
// "../playback/fps.js" or wherever it sits. Cloudflare Pages builds
// on Linux and 404s on a wrong name or case where a phone preview
// resolves it fine.
//
// RETURNS A STOP FUNCTION, not an interval ID. Call it to stop.
// Returns null if playback could not start.
//
//     const stop = playAction(advance);
//     ...
//     if (stop) stop();
//
// BREAKING: the previous version returned a setInterval ID. Any
// stopAction that calls clearInterval on the result must be updated
// to call the returned function instead.
//
// CALLER OBLIGATION: stop the previous playback before starting a
// new one. Two calls give two independent rAF loops both advancing
// the same frame counter - playback at double rate, with no visible
// cause. This file cannot detect that; it holds no shared state.
//
// requestAnimationFrame, not setInterval, for three reasons:
//   1. setInterval drifts - it schedules from the end of the last
//      callback, so a long tick pushes every later tick back.
//   2. Background tabs clamp setInterval to ~1000ms, so locking the
//      phone mid-playback desynchronises the animation.
//   3. rAF gives a timestamp, which makes drift correction possible.
// rAF also pauses when the tab is hidden, so playback does not drain
// the battery in a pocket.
//
// Imports frameIntervalMs rather than fps: that function is the one
// place 1000 / fps is computed, and it is called PER TICK, so
// dragging the fps slider during playback takes effect immediately.

// Beyond this much elapsed time, resync to now instead of catching
// up. Covers a backgrounded tab or a long GC pause - without it the
// timer would try to make up every missed frame at once.
const RESYNC_AFTER_INTERVALS = 2;

// rAF cannot deliver a delta exactly equal to the interval - at 60Hz
// it jitters either side of 16.7ms. Without tolerance, any tick
// landing a hair short skips, and the frame waits a full extra rAF:
// 60fps playback alternates between 60 and 30, visibly stuttering.
// The fractional carry below keeps the average rate exact regardless.
const TICK_TOLERANCE_MS = 4;

// Set when a playback callback throws. Read it to show on-screen
// status; there is no dev console on mobile.
let playbackError = "";
export function lastPlaybackError() {
  return playbackError;
  }

  export function playAction(onFrameAdvance) {
    if (typeof onFrameAdvance !== "function") return null;

      let rafId = null;
        let lastFrameTime = null;
          let stopped = false;

            function stop() {
                if (stopped) return;
                    stopped = true;
                        if (rafId !== null) cancelAnimationFrame(rafId);
                            rafId = null;
                              }

                                function tick(now) {
                                    if (stopped) return;

                                        // Queue the next tick first, so a stop() called from inside
                                            // onFrameAdvance cancels the right id.
                                                rafId = requestAnimationFrame(tick);

                                                    // First tick only establishes the baseline - advancing here would
                                                        // skip a frame at the very start.
                                                            if (lastFrameTime === null) {
                                                                  lastFrameTime = now;
                                                                        return;
                                                                            }

                                                                                const interval = frameIntervalMs();
                                                                                    const elapsed = now - lastFrameTime;
                                                                                        if (elapsed < interval - TICK_TOLERANCE_MS) return;

                                                                                            // Add the interval rather than assigning now, so the leftover
                                                                                                // fraction carries forward and the rate stays accurate over a
                                                                                                    // long loop. rAF fires every ~16.7ms, so a 12fps frame lands on
                                                                                                        // the 5th tick at 83.35ms against an ideal 83.33ms.
                                                                                                            lastFrameTime =
                                                                                                                  elapsed > interval * RESYNC_AFTER_INTERVALS ? now : lastFrameTime + interval;

                                                                                                                      // A throwing callback would otherwise throw on EVERY tick, ~60
                                                                                                                          // times a second, forever - invisible on a phone. Surviving one
                                                                                                                              // bad tick is worth it; looping on a permanently broken callback
                                                                                                                                  // is not. Stop and leave a reason on screen.
                                                                                                                                      try {
                                                                                                                                            onFrameAdvance();
                                                                                                                                                } catch (err) {
                                                                                                                                                      playbackError = `Playback stopped: ${err?.message || "frame advance failed"}`;
                                                                                                                                                            stop();
                                                                                                                                                                }
                                                                                                                                                                  }

                                                                                                                                                                    playbackError = "";
                                                                                                                                                                      rafId = requestAnimationFrame(tick);

                                                                                                                                                                        // Idempotent: safe to call more than once, and safe to call after
                                                                                                                                                                          // playback has already stopped.
                                                                                                                                                                            return stop;
                                                                                                                                                                            }