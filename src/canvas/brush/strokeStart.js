// Handles the moment a stroke begins only.
//
// Contract:
//   canvasRef - React ref to the <canvas> element
//   x, y      - pointer position in canvas px
//
// Returns { lastX, lastY } on success, or null if the stroke cannot
// start. The caller MUST hold the returned object and pass it into
// strokeMove; this file stores no state of its own.
//
// A null return means "no stroke in progress" - the caller should
// skip strokeMove and strokeEnd entirely.
export function strokeStart(canvasRef, x, y) {
  // canvasRef.current is null on first render and after unmount.
    // Dereferencing it throws and kills the whole pointer-down handler.
      if (!canvasRef || !canvasRef.current) return null;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

          const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return null;

              ctx.beginPath();
                ctx.moveTo(x, y);

                  return { lastX: x, lastY: y };
                  }