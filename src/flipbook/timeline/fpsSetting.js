// Owns the frames-per-second value only.

// Bounds. Exported so the FPS slider clamps against the same limits.
//
// MIN is 1, not 0: fps becomes a frame interval as 1000 / fps, so 0
// gives Infinity and playback silently freezes. A negative or NaN is
// worse - setTimeout treats both as 0 and runs an unthrottled loop
// that pins the main thread and drains the battery.
//
// MAX is 60 as a deliberate ceiling for hand-drawn animation, not a
// hardware limit - many phones now refresh at 90 or 120Hz. Above 60
// the frame count per second of animation grows faster than anyone
// wants to draw, and playback gains nothing visible.
export const FPS_MIN = 1;
export const FPS_MAX = 60;
export const FPS_DEFAULT = 12;

// Module state, deliberately global to this session.
//
// NOTE: projects.fps is stored PER PROJECT in db.projects, and this
// value is not reconciled with it. Opening a second project leaves
// the previous project's rate in place until something calls setFps.
// Whoever loads a project must call setFps(project.fps) - this file
// cannot do it, since it never sees a project.
export let fps = FPS_DEFAULT;

// Coerces (sliders emit strings), rejects NaN/null/undefined, rounds
// to a whole frame rate, and clamps to FPS_MIN..FPS_MAX. Invalid
// input leaves the current value unchanged.
//
// Rejects non-numeric types first: Number(null), Number("") and
// Number([]) are all 0, which would clamp to FPS_MIN and silently
// drop playback to 1fps.
//
// Rounds INSIDE the clamp, so 0.4 rounds to 0 and then clamps to
// FPS_MIN. Rounding after clamping could push a value back out of
// range at the boundaries.
//
// Returns the rate actually in effect after the call.
export function setFps(newFps) {
  if (typeof newFps !== "number" && typeof newFps !== "string") return fps;
    if (newFps === "") return fps;

      const parsed = Number(newFps);
        if (!Number.isFinite(parsed)) return fps;

          fps = Math.min(FPS_MAX, Math.max(FPS_MIN, Math.round(parsed)));
            return fps;
            }

            // Milliseconds between frames. Exported so no consumer recomputes
            // 1000 / fps and reintroduces the divide-by-zero this file exists to
            // prevent. Call it per tick - fps can change mid-playback, and a
            // cached interval would not pick that up until playback restarted.
            export function frameIntervalMs() {
              return 1000 / fps;
              }