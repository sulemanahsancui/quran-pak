import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import TrayManager from "./tray.js";

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;

// Initialize isQuitting property
(app as any).isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      sandbox: false,
    },
  });

  // Initialize tray manager
  trayManager = new TrayManager(mainWindow);

  // Load the app
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5123");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Handle window close
  mainWindow.on("close", (event) => {
    if (!(app as any).isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (trayManager) {
      trayManager.destroy();
      trayManager = null;
    }
  });
}

// // Handle IPC events
ipcMain.on("update-last-position", (_event, page: number) => {
  trayManager?.updateLastPosition(page);
});

// App ready
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle app quit
app.on("before-quit", () => {
  (app as any).isQuitting = true;
});
