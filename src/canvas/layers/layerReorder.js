// Moves a layer from one position to another only.

// Both indices must be integers within the list. splice would
// otherwise accept them silently: a negative index counts from the
// end, so a findIndex miss of -1 moves the LAST layer instead of
// failing, and an out-of-range fromIndex removes nothing and then
// inserts undefined into the list.
function isValidIndex(value, length) {
  return Number.isInteger(value) && value >= 0 && value < length;
  }

  // Returns a NEW array on success.
  //
  // Returns the SAME array reference when nothing moved - either index
  // is invalid, or from and to are equal. The caller's setLayers() is
  // then a no-op and React skips the re-render. Compare by reference
  // to detect this.
  //
  // Returns a new EMPTY array if the input is not an array, matching
  // layerAdd and layerRemove.
  //
  // toIndex is the destination in the list AFTER the layer is lifted
  // out, which is what drag-and-drop reports. Moving index 0 to index
  // 2 in a 3-layer list lands it last, not second.
  //
  // Z-ORDER: index 0 is the BOTTOM layer, drawn first; the last index
  // is the TOP layer, drawn last. A layer panel that lists top-first
  // must invert its indices before calling, or dragging up moves down.
  export function layerReorder(layersList, fromIndex, toIndex) {
    if (!Array.isArray(layersList)) return [];

      const { length } = layersList;
        if (!isValidIndex(fromIndex, length)) return layersList;
          if (!isValidIndex(toIndex, length)) return layersList;
            if (fromIndex === toIndex) return layersList;

              const updated = [...layersList];
                const [moved] = updated.splice(fromIndex, 1);
                  updated.splice(toIndex, 0, moved);

                    return updated;
                    }