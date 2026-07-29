import { interpolationLinear } from "./interpolationLinear.js";

// Quadratic ease-in: starts slow, speeds up, only.
//
//   progress 0    -> start
//   progress 0.5  -> 25% of the way (not halfway)
//   progress 1    -> end
//
// Bends progress, then hands the lerp to interpolationLinear rather
// than repeating the formula. Every easing file in this folder should
// do the same - the lerp lives in exactly one place.
//
// CAUTION outside 0..1, where this and interpolationLinear disagree:
// squaring destroys sign, so progress -0.5 becomes +0.25 and moves
// FORWARD, where linear would move backward. Overshoot above 1 is
// also amplified - progress 2 gives 4, double the linear overshoot.
// Swapping easing functions changes behavior outside the range even
// though it does not inside it. Clamp progress at the caller.
//
// Quadratic (power 2) specifically. A cubic or quartic ease-in is a
// visibly different curve and belongs in its own file -
// interpolationEaseInCubic.js and so on - not a degree parameter
// here, which would turn a branchless primitive into a Math.pow call.
export function interpolationEaseIn(start, end, progress) {
  return interpolationLinear(start, end, progress * progress);
  }