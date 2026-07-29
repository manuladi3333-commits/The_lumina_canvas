// Converts a picked file into a usable image object only.
//
// Resolves with a decoded HTMLImageElement, or null on any failure -
// unreadable file, unsupported format, or timeout.
// NEVER rejects, matching pickImageFile. Callers null-check.
//
// A null return most often means an UNSUPPORTED FORMAT, not a broken
// file. pickImageFile's accept="image/*" admits HEIC, which iPhones
// shoot by default and Chrome/Firefox on Android cannot decode. Show
// the user a "couldn't read that image" message, not a silent nothing.
//
// The caller owns the returned image. It holds a decoded bitmap -
// roughly width x height x 4 bytes, so ~48MB for a 12MP photo. Draw
// it to a downscaled canvas and drop the reference; do not keep it.

// Nothing should take this long on a local file. Without it, a decode
// that neither loads nor errors would leave the promise pending and
// the import button dead until reload.
const READ_TIMEOUT_MS = 30000;

export function readImageFile(file) {
  return new Promise((resolve) => {
      // pickImageFile resolves null on cancel, and that null lands here
          // if a caller passes it straight through. Guard rather than let
              // createObjectURL throw.
                  if (!(file instanceof Blob)) {
                        resolve(null);
                              return;
                                  }

                                      // Object URL, not readAsDataURL: base64 would add a copy ~33%
                                          // larger than the file, held alongside the blob and the bitmap.
                                              const url = URL.createObjectURL(file);
                                                  const img = new Image();

                                                      let settled = false;
                                                          const settle = (result) => {
                                                                if (settled) return;
                                                                      settled = true;
                                                                            clearTimeout(timer);
                                                                                  // Must revoke, or the blob is retained for the page's lifetime.
                                                                                        URL.revokeObjectURL(url);
                                                                                              resolve(result);
                                                                                                  };

                                                                                                      const timer = setTimeout(() => settle(null), READ_TIMEOUT_MS);

                                                                                                          img.onload = () => settle(img);
                                                                                                              img.onerror = () => settle(null);

                                                                                                                  // Assigned last: a cached image can decode fast enough to fire
                                                                                                                      // before a handler attached afterwards.
                                                                                                                          img.src = url;
                                                                                                                            });
                                                                                                                            }