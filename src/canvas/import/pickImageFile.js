// Opens the device file picker and returns the selected file only.
//
// Resolves with a File, or null if the user cancelled.
// NEVER rejects - callers should null-check, not try/catch.
//
// MUST be called directly from a tap handler. input.click() needs an
// active user gesture, and iOS Safari silently refuses it after an
// await - no picker, no error. Do not put async work before this.
//
// NOTE: image/* admits HEIC, which is what an iPhone camera produces
// by default. Safari decodes it; Chrome and Firefox on Android do
// not. readImageFile must handle a decode failure rather than assume
// every accepted file is drawable.

// How long to wait after the page regains focus before deciding the
// picker was dismissed. This is a CORRECTNESS threshold, not a
// performance one: too short and a real pick is discarded as a
// cancel. Shooting a new photo in-camera delivers change well after
// focus returns, so this is deliberately generous - the only cost of
// being slow is a late null on an actual cancel.
const CANCEL_GRACE_MS = 2000;

// The tap that opens the picker can itself produce a focus event
// before the picker is up. Attaching the fallback after a short delay
// keeps that from being mistaken for a return-from-picker.
const FOCUS_ARM_DELAY_MS = 300;

export function pickImageFile() {
  return new Promise((resolve) => {
      const input = document.createElement("input");
          input.type = "file";
              input.accept = "image/*";

                  // All paths race, and the picker can fire only one of them.
                      // settle() makes the losers no-ops, so the promise resolves once.
                          let settled = false;
                              let cancelTimer = null;

                                  const settle = (file) => {
                                        if (settled) return;
                                              settled = true;
                                                    clearTimeout(cancelTimer);
                                                          window.removeEventListener("focus", onFocus);
                                                                resolve(file);
                                                                    };

                                                                        // Some Android pickers fire change with an empty list on cancel,
                                                                            // so treat a missing file as a cancel rather than resolving
                                                                                // undefined into a caller expecting a File.
                                                                                    input.onchange = (e) => settle(e.target.files?.[0] ?? null);

                                                                                        // Fires on cancel in newer browsers. Support is recent enough that
                                                                                            // I would not rely on it alone - the focus fallback below covers
                                                                                                // the rest. Verify on your own phone.
                                                                                                    input.oncancel = () => settle(null);

                                                                                                        // Fallback: returning to the page without a change event means the
                                                                                                            // picker was dismissed.
                                                                                                                //
                                                                                                                    // NOT registered with { once: true }. A single stray focus would
                                                                                                                        // otherwise consume the only listener, leaving a real cancel with
                                                                                                                            // nothing to resolve the promise - it would hang forever.
                                                                                                                                // Restarting the timer on each focus is correct: the last return
                                                                                                                                    // to the page is the one that matters.
                                                                                                                                        function onFocus() {
                                                                                                                                              clearTimeout(cancelTimer);
                                                                                                                                                    cancelTimer = setTimeout(() => settle(null), CANCEL_GRACE_MS);
                                                                                                                                                        }

                                                                                                                                                            input.click();

                                                                                                                                                                // Armed after the click, so the tap's own focus cannot trigger it.
                                                                                                                                                                    setTimeout(() => {
                                                                                                                                                                          if (!settled) window.addEventListener("focus", onFocus);
                                                                                                                                                                              }, FOCUS_ARM_DELAY_MS);
                                                                                                                                                                                });
                                                                                                                                                                                }