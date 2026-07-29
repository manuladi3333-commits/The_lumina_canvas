// Owns the currently selected color only.

// Single source of truth for the default. strokeMove.js should import
// this instead of keeping its own FALLBACK_COLOR literal.
export const DEFAULT_COLOR = "#000000";

export let currentColor = DEFAULT_COLOR;

// Canvas silently ignores an invalid fillStyle - no throw, no warning -
// leaving the previous color in place. So a bad value here would draw
// in a stale color with no way to see why on a phone. Validate instead.

// These parse as valid CSS colors but mean nothing to fillStyle, so
// canvas would ignore them and keep the previous color.
const UNUSABLE = new Set(["currentcolor", "inherit", "initial", "unset", "revert"]);

// Fallback for engines without CSS.supports. Looser than the check
// below - it cannot verify what is inside rgb()/hsl() parentheses.
const COLOR_PATTERN =
  /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(rgb|hsl)a?\([^()]*\))$/i;

  // CSS.supports uses the browser's own parser, so rgb() and rgb(hello)
  // are rejected where a regex accepts them. Called on color pick only,
  // never in the per-dab draw loop, so its cost does not matter.
  function isValidColor(value) {
    if (UNUSABLE.has(value.toLowerCase())) return false;

      if (typeof CSS !== "undefined" && CSS.supports) {
          return CSS.supports("color", value);
            }
              return COLOR_PATTERN.test(value);
              }

              // Invalid input leaves the current color unchanged.
              // Returns the color actually in effect after the call.
              //
              // Note: 8-digit hex carries its own alpha, which multiplies with
              // brushOpacity in strokeMove. #00000080 at opacity 0.5 draws at 0.25.
              export function setCurrentColor(newColor) {
                if (typeof newColor !== "string") return currentColor;

                  const trimmed = newColor.trim();
                    if (!trimmed || !isValidColor(trimmed)) return currentColor;

                      currentColor = trimmed;
                        return currentColor;
                        }