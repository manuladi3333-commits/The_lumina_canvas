// Handles the moment a lasso selection begins only.
//
// Contract:
//   x, y - pointer position in canvas px
//
// Returns { points: [{ x, y }] }, or null if the lasso cannot start.
// A null return means "no selection in progress" - the caller should
// skip lassoMove and lassoEnd entirely, matching strokeStart.
//
// The caller holds the returned object; this file stores no state.
//
// points is MUTABLE ON PURPOSE. lassoMove should push onto it and
// return the same object, not spread a copy. A drag reaches 300-1000
// points, so copying per event allocates a fresh array of that size
// ~60 times a second - sustained garbage pressure, which on a phone
// surfaces as GC pauses and a stuttering outline. (The copying itself
// is cheap; it is the allocation churn that hurts.) This is the
// opposite of the layer files' immutable rule because a lasso is
// transient gesture state, not React render state.
//
// THEREFORE: hold this in a useRef, never useState. Mutating state
// in place does not re-render, and React would skip the render on
// the unchanged reference anyway - the outline would never appear.
export function lassoStart(x, y) {
  // A NaN vertex poisons the whole polygon: bounds become NaN and
    // every point-in-polygon test returns false, so the selection
      // silently selects nothing with no error to see on a phone.
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

          return { points: [{ x, y }] };
          }