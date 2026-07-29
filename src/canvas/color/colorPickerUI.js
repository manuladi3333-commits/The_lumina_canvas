import { currentColor, setCurrentColor } from "./currentColor.js";

// Handles a user tapping/dragging on the color picker UI only.
// Accepts either a color string or the change Event from an
// <input type="color">, so it can be passed straight to onChange.
//
// Returns the color actually in effect after the pick.
//
// To detect a rejected pick, compare the return value against your
// input LOWERCASED - not the raw input. Case is normalized here, so
// a valid "#FF0000" returns "#ff0000" and a raw comparison would
// report a false rejection.
export function handleColorPick(selectedColor) {
  // onChange={handleColorPick} hands over an Event, not a string.
    // setCurrentColor would reject it silently and the color would
      // never change, with nothing on screen explaining why.
        const raw =
            typeof selectedColor === "string"
                  ? selectedColor
                        : selectedColor?.target?.value;

                          // Nothing usable was passed - report the unchanged color.
                            // Read the live binding directly rather than calling the setter
                              // with an invalid value to provoke a rejection.
                                if (typeof raw !== "string") return currentColor;

                                  // Normalize case here, at the boundary, so everything downstream
                                    // holds one format and the swatch highlight can match by equality.
                                      return setCurrentColor(raw.toLowerCase());
                                      }