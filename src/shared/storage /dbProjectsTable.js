// Defines the "projects" table schema only.
// ++id = auto-incrementing primary key
// title, createdAt = searchable/indexed fields
// *frameIds = multiEntry index (indexes each element of the frameIds array)
export const projectsSchema = "++id, title, *frameIds, createdAt";