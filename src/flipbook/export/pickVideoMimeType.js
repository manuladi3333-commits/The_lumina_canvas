// Picks a supported WebM mime type only.
//
// Returns the first type this browser can actually record, or "" if
// none work. MediaRecorder throws NotSupportedError on an
// unsupported type, so this must be checked before constructing one.
//
// ADVISORY, NOT A GUARANTEE. isTypeSupported can return true for a
// type the MediaRecorder constructor then rejects - Safari has done
// exactly this. The caller must still wrap construction in a try;
// exportWebM does. Passing this check is necessary, not sufficient.
//
// Ordered best-quality first. VP9 is smaller at the same quality;
// VP8 is more widely supported; the bare type lets the browser pick.
//
// TRADEOFF WORTH KNOWING: VP9 costs noticeably more CPU to encode
// than VP8, and this records in REAL TIME on a phone. If the encoder
// cannot keep up, MediaRecorder drops frames rather than slowing
// down - a stuttering export that looks like a playback bug. If your
// exports stutter and playback on screen looks fine, try moving vp8
// to the front of this list. File size is rarely the binding
// constraint for a 20-second flipbook.
//
// Safari's support for WebM recording is partial and version-
// dependent. An empty return is a real outcome on iOS, not a bug -
// the caller must handle it rather than assume a codec exists.
const CANDIDATES = [
  "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
      "video/webm",
      ];

      export function pickVideoMimeType() {
        // typeof, not a bare reference: MediaRecorder may not exist at all,
          // and referencing an undeclared global throws ReferenceError.
            if (typeof MediaRecorder === "undefined") return "";

              // The constructor can exist while the static method does not, on
                // older or partial implementations.
                  if (typeof MediaRecorder.isTypeSupported !== "function") return "";

                    for (const type of CANDIDATES) {
                        if (MediaRecorder.isTypeSupported(type)) return type;
                          }
                            return "";
                            }