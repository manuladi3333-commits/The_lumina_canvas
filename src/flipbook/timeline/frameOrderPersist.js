import { db } from "./dbInit.js";

// Owns persisting a frame reorder only.
//
// frameReorder renumbers `order` in memory. This moves the matching
// rows in db.frames so the new sequence survives a reload.
//
// Pass the list frameReorder returned - each frame must carry both
// its new `order` and the `previousOrder` it had before the move.
// Rows are matched by previousOrder, since db.frames has no column
// for the client-side frame id.
//
// NEVER rejects. Resolves true on success, false on failure; read
// lastOrderError() for a short reason to show on screen.
//
// Rows are updated by id in ONE transaction, not deleted and
// recreated. That preserves each row's id, layerData and createdAt,
// and means this never needs layerData held in memory - which
// matters once frames load lazily.
//
// [characterId+order] is a plain compound index, not unique (no &),
// so two rows briefly sharing an order mid-transaction is legal.
// Every row is rewritten before the transaction commits.
//
// CALLER OBLIGATION: pause autosave until this resolves. A frameSave
// firing mid-rewrite would look up a row by an order that is being
// reassigned and bind one frame to another frame's storage.

let orderError = "";
export function lastOrderError() {
  return orderError;
  }

  function normalizeId(characterId) {
    if (typeof characterId === "number") return Number.isInteger(characterId) ? characterId : null;
      if (typeof characterId !== "string" || characterId.trim() === "") return null;
        const id = Number(characterId);
          return Number.isInteger(id) ? id : null;
          }

          export async function frameOrderPersist(characterId, framesList) {
            const id = normalizeId(characterId);
              if (id === null) {
                  orderError = "Invalid project key";
                      return false;
                        }
                          if (!Array.isArray(framesList) || framesList.length === 0) {
                              orderError = "Invalid frame list";
                                  return false;
                                    }

                                      // Every frame must carry both numbers, or the mapping is ambiguous
                                        // and a partial rewrite would scramble the sequence.
                                          const moves = [];
                                            for (const frame of framesList) {
                                                if (!Number.isInteger(frame?.order) || !Number.isInteger(frame?.previousOrder)) {
                                                      orderError = "Frame list is missing order data - reorder again";
                                                            return false;
                                                                }
                                                                    if (frame.order !== frame.previousOrder) {
                                                                          moves.push({ from: frame.previousOrder, to: frame.order });
                                                                              }
                                                                                }

                                                                                  if (moves.length === 0) {
                                                                                      orderError = "";
                                                                                          return true;
                                                                                            }

                                                                                              try {
                                                                                                  await db.transaction("rw", db.frames, async () => {
                                                                                                        // Read every affected row BEFORE writing any, so no lookup can
                                                                                                              // hit an order that has already been reassigned.
                                                                                                                    const rows = await Promise.all(
                                                                                                                            moves.map((move) =>
                                                                                                                                      db.frames.where("[characterId+order]").equals([id, move.from]).first()
                                                                                                                                              )
                                                                                                                                                    );

                                                                                                                                                          const updates = [];
                                                                                                                                                                rows.forEach((row, i) => {
                                                                                                                                                                        // A frame added but never saved has no row yet. Skip it -
                                                                                                                                                                                // frameSave will create it at its current order.
                                                                                                                                                                                        if (row) updates.push({ ...row, order: moves[i].to });
                                                                                                                                                                                              });

                                                                                                                                                                                                    if (updates.length > 0) await db.frames.bulkPut(updates);
                                                                                                                                                                                                        });

                                                                                                                                                                                                            orderError = "";
                                                                                                                                                                                                                return true;
                                                                                                                                                                                                                  } catch (err) {
                                                                                                                                                                                                                      orderError =
                                                                                                                                                                                                                            err?.name === "QuotaExceededError"
                                                                                                                                                                                                                                    ? "Device storage is full"
                                                                                                                                                                                                                                            : "Could not save the new frame order";
                                                                                                                                                                                                                                                return false;
                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                  }