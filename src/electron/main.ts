import { app, BrowserWindow } from "electron";
import { isDev } from "./util.js";
import { getUIPath } from "./pathResolver.js";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      // Enable geolocation
      enableBlinkFeatures: "Geolocation",
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(getUIPath());
  }

  // Handle location permissions
  mainWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      // Always allow geolocation
      if (permission === "geolocation") {
        console.log("Geolocation permission granted");
        callback(true);
        return;
      }
      // Deny other permissions
      callback(false);
    }
  );

  // Enable geolocation
  mainWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "geolocation") {
        callback(true);
      } else {
        callback(false);
      }
    }
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Create window when app is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
