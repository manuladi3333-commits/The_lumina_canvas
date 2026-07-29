// Sanitises a download filename only.
//
// A slash is the real hazard: a project title like "frame 1/2" is
// read as a path by the OS. Leading dots make a hidden file.
//
// extension is forced, since an extensionless download will not open
// on some systems. Pass it without the dot: "png", "webm".

// Filesystems cap a name near 255 bytes. Cap the base well under
// that so multibyte titles and the extension both fit.
const MAX_BASE_LENGTH = 80;

export function safeFilename(filename, extension) {
  // Validated rather than escaped: every real caller passes a plain
    // alphanumeric extension, and anything else is a bug worth
      // falling back on rather than regex-escaping into a bad name.
        const ext = /^[a-z0-9]+$/i.test(extension) ? extension : "bin";

          const raw = typeof filename === "string" ? filename : "";

            const cleaned = raw
                // Control characters survive a plain trim and make the file hard
                    // to reference from a file manager later.
                        .replace(/[\x00-\x1f\x7f]/g, "")
                            .replace(/[\\/:*?"<>|]/g, "-")
                                .trim()
                                    .replace(/^\.+/, "")
                                        // Windows strips trailing dots and spaces itself, which would
                                            // desync the name from what the app thinks it saved.
                                                .replace(/[.\s]+$/, "");

                                                  // Array.from splits by code point, so a cap cannot cut an emoji in
                                                    // half and leave a broken surrogate in the filename.
                                                      const capped = Array.from(cleaned).slice(0, MAX_BASE_LENGTH).join("");

                                                        const base = capped || "export";
                                                          const pattern = new RegExp(`\\.${ext}$`, "i");
                                                            return pattern.test(base) ? base : `${base}.${ext}`;
                                                            }