import { interpolationLinear } from "./interpolationLinear.js";

// Quadratic ease-out: starts fast, slows down, only.
//
//   progress 0    -> start
//   progress 0.5  -> 75% of the way (not halfway)
//   progress 1    -> end
//
// The mirror of interpolationEaseIn: flip, square, flip back, which
// is 1 - easeIn(1 - p). Bends progress, then hands the lerp to
// interpolationLinear rather than repeating the formula - the lerp
// lives in exactly one file.
//
// x * x rather than Math.pow(x, 2): shorter, and not dependent on the
// engine lowering a general-purpose call to a multiply.
//
// CAUTION outside 0..1 - this is the worst offender of the three.
// Squaring destroys sign, so an overshoot REVERSES: progress 2 gives
// (1-2)^2 = 1, so eased = 0 and the function returns START, not past
// end. Linear would return double the distance and easeIn quadruple
// it. Three easing files, three different behaviors past 1. Clamp
// progress at the caller.
//
// Quadratic (power 2) specifically. A cubic or quartic ease-out is a
// visibly different curve and belongs in its own file -
// interpolationEaseOutCubic.js and so on - not a degree parameter
// here, which would turn a branchless primitive into a Math.pow call.
export function interpolationEaseOut(start, end, progress) {
  const inverted = 1 - progress;
    return interpolationLinear(start, end, 1 - inverted * inverted);
    }