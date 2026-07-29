import { DEFAULT_COLOR } from "./currentColor.js";

// Owns the list of preset swatch colors only.

// Lowercase is required, not cosmetic. <input type="color"> returns
// lowercase hex and setCurrentColor stores it verbatim, so an
// uppercase entry here would never equality-match currentColor and
// the selected-swatch highlight would silently never appear.
//
// toLowerCase is applied rather than assumed, because index 0 comes
// from another file where this constraint is not visible.
//
// Frozen because const guards the binding, not the contents - an
// unfrozen export lets any importer push or splice shared state.
// Every element is a primitive string, so a shallow freeze is total.
export const paletteColors = Object.freeze(
  [
      DEFAULT_COLOR, "#ffffff", "#ff0000", "#00ff00",
          "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
            ].map((color) => color.toLowerCase())
            );