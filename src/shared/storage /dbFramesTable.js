// Defines the "frames" table schema only.
// ++id = auto-incrementing primary key
// characterId, order, createdAt = searchable/indexed fields
// [characterId+order] = compound index (owner + position, pre-sorted for timeline reads)
export const framesSchema = "++id, characterId, order, createdAt, [characterId+order]";