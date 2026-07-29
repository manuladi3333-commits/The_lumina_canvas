// Linear interpolation: constant speed between two values only.
//
//   progress 0   -> start
//   progress 1   -> end
//   progress 0.5 -> exact midpoint
//
// progress is NOT clamped, on purpose. Values outside 0..1
// extrapolate past the endpoints, which is what an overshoot or
// anticipation ease needs. A caller computing elapsed / duration
// must clamp it itself, or an overrun will fly past `end`.
//
// NOT GUARDED, on purpose. Passing NaN returns NaN. This is a hot-
// path primitive - a branchless expression the engine can inline -
// and validating every call would cost more than the arithmetic
// while hiding the caller's bug instead of surfacing it. Validate
// where progress is computed.
//
// Uses start + (end - start) * progress rather than
// start * (1 - progress) + end * progress: one fewer multiply, at
// the cost of floating-point error possibly leaving progress = 1 a
// hair short of `end`. Invisible for animation positions. If you
// ever need an exact endpoint - a colour channel that must land on
// 255, say - use the other form there, not here.
export function interpolationLinear(start, end, progress) {
  return start + (end - start) * progress;
  }