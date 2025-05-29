import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  tray: {
    onGoToPosition: (callback: (position: { page: number }) => void) => {
      ipcRenderer.on("go-to-position", (_event, position) =>
        callback(position)
      );
    },
    onNavigatePage: (callback: (delta: number) => void) => {
      ipcRenderer.on("navigate-page", (_event, delta) => callback(delta));
    },
    onOpenSettings: (callback: () => void) => {
      ipcRenderer.on("open-settings", () => callback());
    },
    updateLastPosition: (page: number) => {
      ipcRenderer.send("update-last-position", page);
    },
  },
});
