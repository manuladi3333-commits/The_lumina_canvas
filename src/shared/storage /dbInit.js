import Dexie from "dexie";
import { charactersSchema } from "./dbCharactersTable.js";
import { framesSchema } from "./dbFramesTable.js";
import { projectsSchema } from "./dbProjectsTable.js";

// Single shared database connection for Vault, Canvas, and Flipbook.
export const db = new Dexie("LuminasCanvasDB");

db.version(1).stores({
  characters: charactersSchema,
    frames: framesSchema,
      projects: projectsSchema,
      });

      // Live status object. Stable reference, so any page that imports it
      // sees updates. Shown as on-screen text (no dev console on mobile).
      export const dbStatus = {
        ok: null,
          message: "Opening database\u2026",
          };

          // Fires when a future db.version(2) upgrade is held up by another open tab.
          db.on("blocked", () => {
            dbStatus.ok = false;
              dbStatus.message = "Database upgrade blocked. Close other tabs of this app, then reload.";
              });

              // Open eagerly so failures surface here instead of inside a random query.
              export const dbReady = db
                .open()
                  .then(() => {
                      dbStatus.ok = true;
                          dbStatus.message = "Database ready.";
                              return true;
                                })
                                  .catch((err) => {
                                      dbStatus.ok = false;
                                          dbStatus.message = `Storage unavailable (${err.name}). Private browsing or full device storage can cause this.`;
                                              return false;
                                                });