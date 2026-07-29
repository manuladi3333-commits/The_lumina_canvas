// Exports the current frame's canvas as a PNG file only.
//
// NOW ASYNC AND RETURNS A BOOLEAN. Previously returned nothing.
//     const ok = await exportPNG(canvas, "frame-1.png");
//
// Resolves true if the download was TRIGGERED, false otherwise.
// NEVER rejects - read lastExportError() for a reason to show on
// screen, since there is no console on a phone.
//
// true does NOT guarantee a file was saved. link.click() returns
// normally even when the browser refuses the download or navigates
// instead - see the iOS caveat below. There is no reliable way to
// confirm a save from script.
//
// toBlob, not toDataURL: toDataURL blocks the main thread for
// 50-150ms encoding the whole canvas and produces a base64 string a
// third larger than the PNG. toBlob is async and skips base64
// entirely.
//
// EXPORTS WHAT THIS CANVAS ELEMENT SHOWS. If layers render to
// separate canvases, composite them onto one canvas first and pass
// that - this file does not know about layers and will not include
// what it cannot see.
//
// iOS SAFARI CAVEAT: the download attribute has historically been
// ignored on iOS, which navigates to the file instead of saving it.
// An object URL is used rather than a data URL, since navigating to
// a blob URL at least does not carry a multi-megabyte string. VERIFY
// ON YOUR OWN PHONE. If it navigates away from the app, the reliable
// path on iOS is navigator.share with the blob as a file - that
// belongs in its own exportShare.js, not a branch here.

// Object URLs are revoked after this long. Revoking immediately can
// cancel a download that has not started reading yet.
const REVOKE_DELAY_MS = 60000;

// Beyond this, assume toBlob's callback will never fire.
const ENCODE_TIMEOUT_MS = 30000;

let exportError = "";
export function lastExportError() {
  return exportError;
  }

  // Strips characters the filesystem treats specially. A slash is the
  // real hazard - a project title like "frame 1/2" would otherwise read
  // as a path. Also forces the .png extension the function promises,
  // since an extensionless file will not open on some systems.
  function safeFilename(filename) {
    const raw = typeof filename === "string" ? filename.trim() : "";
      const cleaned = raw.replace(/[\\/:*?"<>|]/g, "-").replace(/^\.+/, "");
        const base = cleaned || "frame";
          return /\.png$/i.test(base) ? base : `${base}.png`;
          }

          export async function exportPNG(canvasElement, filename = "frame.png") {
            // Duck-typed rather than instanceof, so an OffscreenCanvas from a
              // layer composite works too.
                if (!canvasElement || typeof canvasElement.toBlob !== "function") {
                    exportError = "No canvas to export";
                        return false;
                          }

                            const name = safeFilename(filename);

                              let blob;
                                try {
                                    // toBlob reports failure by passing null, not by throwing, so the
                                        // callback result is checked as well as the call itself.
                                            // A canvas tainted by a cross-origin image throws SecurityError.
                                                blob = await new Promise((resolve, reject) => {
                                                      // Cleared on settle, or it holds this closure for 30s after
                                                            // every successful export.
                                                                  const timer = setTimeout(() => reject(new Error("timeout")), ENCODE_TIMEOUT_MS);

                                                                        canvasElement.toBlob((result) => {
                                                                                clearTimeout(timer);
                                                                                        resolve(result);
                                                                                              }, "image/png");
                                                                                                  });
                                                                                                    } catch (err) {
                                                                                                        exportError =
                                                                                                              err?.name === "SecurityError"
                                                                                                                      ? "Canvas holds a cross-origin image and cannot be exported"
                                                                                                                              : "Could not encode the image";
                                                                                                                                  return false;
                                                                                                                                    }

                                                                                                                                      if (!blob) {
                                                                                                                                          exportError = "Could not encode the image";
                                                                                                                                              return false;
                                                                                                                                                }

                                                                                                                                                  const url = URL.createObjectURL(blob);

                                                                                                                                                    try {
                                                                                                                                                        const link = document.createElement("a");
                                                                                                                                                            link.download = name;
                                                                                                                                                                link.href = url;
                                                                                                                                                                    link.click();
                                                                                                                                                                      } catch {
                                                                                                                                                                          URL.revokeObjectURL(url);
                                                                                                                                                                              exportError = "Could not start the download";
                                                                                                                                                                                  return false;
                                                                                                                                                                                    }

                                                                                                                                                                                      // Must revoke, or the blob is retained for the page's lifetime.
                                                                                                                                                                                        setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);

                                                                                                                                                                                          exportError = "";
                                                                                                                                                                                            return true;
                                                                                                                                                                                            }