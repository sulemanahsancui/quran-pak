import path from "path";
import { fileURLToPath } from "url";
import TrayManager from "./tray.js";
import ClipboardManager from "./clipboard.js";
import HistoryManager from "./historyManager.js";
import { getPreloadPath } from "./pathResolver.js";
import BookmarkManager from "./bookmarkManager.js";
import NotificationManager from "./notifications.js";
import PowerMonitorManager from "./powerMonitor.js";
import RecitationManager from "./recitationManager.js";
import ScreenCaptureManager from "./screenCapture.js";
import TranslationManager from "./translationManager.js";
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;
let powerMonitorManager: PowerMonitorManager | null = null;
let screenCaptureManager: ScreenCaptureManager | null = null;
let clipboardManager: ClipboardManager | null = null;
let bookmarkManager: BookmarkManager | null = null;
let recitationManager: RecitationManager | null = null;
let translationManager: TranslationManager | null = null;
let notificationManager: NotificationManager | null = null;
let historyManager: HistoryManager | null = null;
const isDev = process.env.NODE_ENV === "development";

// Initialize isQuitting property
(app as any).isQuitting = false;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath(),
    },
  });

  // Load the app
  if (isDev) {
    // In development, load from the dev server
    mainWindow.loadURL("http://localhost:5123");
    // Open DevTools
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
  }

  // Initialize managers
  trayManager = new TrayManager(mainWindow);
  powerMonitorManager = new PowerMonitorManager(mainWindow);
  screenCaptureManager = new ScreenCaptureManager(mainWindow);
  clipboardManager = new ClipboardManager(mainWindow);
  bookmarkManager = new BookmarkManager(mainWindow);
  recitationManager = new RecitationManager(mainWindow);
  translationManager = new TranslationManager(mainWindow);
  notificationManager = NotificationManager.getInstance(mainWindow);
  historyManager = new HistoryManager(mainWindow);

  // Create the application menu
  const template: any = [
    {
      label: "File",
      submenu: [
        {
          label: "Open File",
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ["openFile"],
              filters: [{ name: "Text Files", extensions: ["txt"] }],
            });
            if (!result.canceled) {
              mainWindow?.webContents.send("file-opened", result.filePaths[0]);
            }
          },
        },
        { type: "separator" },
        {
          label: "Exit",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Handle window state
  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window-maximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window-unmaximized");
  });

  mainWindow.on("minimize", () => {
    mainWindow?.webContents.send("window-minimized");
  });

  mainWindow.on("restore", () => {
    mainWindow?.webContents.send("window-restored");
  });

  // Handle window close
  mainWindow.on("close", (event) => {
    if (!(app as any).isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Notification handlers
  ipcMain.on("show-notification", (_, options) => {
    notificationManager?.showNotification(options);
  });

  ipcMain.on("show-prayer-notification", (_, { prayerName, time }) => {
    notificationManager?.showPrayerTimeNotification(prayerName, time);
  });

  ipcMain.on("show-bookmark-notification", (_, { surahName, ayahNumber }) => {
    notificationManager?.showBookmarkNotification(surahName, ayahNumber);
  });

  // Bookmark handlers
  ipcMain.handle("get-all-bookmarks", () => {
    return bookmarkManager?.getBookmarks();
  });

  ipcMain.handle("get-bookmarks-by-surah", (_, surahNumber) => {
    return bookmarkManager?.getBookmarksBySurah(surahNumber);
  });

  ipcMain.on("add-bookmark", (_, bookmark) => {
    bookmarkManager?.addBookmark(bookmark);
    notificationManager?.showBookmarkNotification(
      bookmark.surahName,
      bookmark.ayahNumber
    );
  });

  ipcMain.on("remove-bookmark", (_, id) => {
    bookmarkManager?.removeBookmark(id);
    notificationManager?.showSuccessNotification("Bookmark has been removed");
  });

  ipcMain.on("update-bookmark-note", (_, { id, note }) => {
    bookmarkManager?.updateBookmarkNote(id, note);
  });

  ipcMain.on("clear-all-bookmarks", () => {
    bookmarkManager?.clearAllBookmarks();
  });

  // Recitation handlers
  ipcMain.handle("get-recitation-settings", () => {
    return recitationManager?.getSettings();
  });

  ipcMain.on("update-recitation-settings", (_, settings) => {
    recitationManager?.updateSettings(settings);
  });

  ipcMain.handle("get-reciters", () => {
    return recitationManager?.getReciters();
  });

  ipcMain.handle("get-current-reciter", () => {
    return recitationManager?.getCurrentReciter();
  });

  ipcMain.on("play-ayah", (_, { surahNumber, ayahNumber }) => {
    recitationManager?.playAyah(surahNumber, ayahNumber);
  });

  ipcMain.on("play-surah", (_, { surahNumber }) => {
    recitationManager?.playSurah(surahNumber);
  });

  ipcMain.on("pause-playback", () => {
    recitationManager?.pausePlayback();
  });

  ipcMain.on("resume-playback", () => {
    recitationManager?.resumePlayback();
  });

  ipcMain.on("stop-playback", () => {
    recitationManager?.stopPlayback();
  });

  ipcMain.on("set-volume", (_, volume) => {
    recitationManager?.setVolume(volume);
  });

  ipcMain.on("set-playback-speed", (_, speed) => {
    recitationManager?.setPlaybackSpeed(speed);
  });

  // History handlers
  ipcMain.handle("get-reading-history", async () => {
    console.log("Getting reading history");
    const history = historyManager?.getLastProgress();
    console.log("History retrieved:", history);
    return history;
  });

  ipcMain.handle("get-last-progress", async () => {
    console.log("Getting last progress");
    const history = historyManager?.getLastProgress();
    console.log("Last progress retrieved:", history);
    return history;
  });

  ipcMain.on(
    "save-reading-progress",
    (_, { surahNumber, ayahNumber, pageNumber }) => {
      console.log("Saving reading progress:", {
        surahNumber,
        ayahNumber,
        pageNumber,
      });
      if (historyManager) {
        historyManager.saveProgress(surahNumber, ayahNumber, pageNumber);
      }
    }
  );

  ipcMain.on("clear-reading-history", () => {
    console.log("Clearing reading history");
    historyManager?.clearHistory();
  });

  // Translation handlers
  ipcMain.handle("get-translation-settings", () => {
    return translationManager?.getSettings();
  });

  ipcMain.on("update-translation-settings", (_, settings) => {
    translationManager?.updateSettings(settings);
  });

  ipcMain.handle("get-translations", () => {
    return translationManager?.getTranslations();
  });

  ipcMain.handle("get-primary-translation", () => {
    return translationManager?.getPrimaryTranslation();
  });

  ipcMain.handle("get-secondary-translation", () => {
    return translationManager?.getSecondaryTranslation();
  });

  ipcMain.on("set-primary-translation", (_, id) => {
    translationManager?.setPrimaryTranslation(id);
  });

  ipcMain.on("set-secondary-translation", (_, id) => {
    translationManager?.setSecondaryTranslation(id);
  });

  ipcMain.on("toggle-arabic", () => {
    translationManager?.toggleArabic();
  });

  ipcMain.on("toggle-transliteration", () => {
    translationManager?.toggleTransliteration();
  });

  ipcMain.on("set-font-size", (_, size) => {
    translationManager?.setFontSize(size);
  });

  ipcMain.on("set-line-spacing", (_, spacing) => {
    translationManager?.setLineSpacing(spacing);
  });

  // Clean up on window close
  mainWindow.on("closed", () => {
    mainWindow = null;
    trayManager?.destroy();
    powerMonitorManager?.destroy();
  });
}

// App lifecycle events
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  (app as any).isQuitting = true;
});

// IPC handlers for main process
ipcMain.handle("get-app-path", () => {
  return app.getPath("userData");
});

ipcMain.handle("show-save-dialog", async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result;
});

ipcMain.handle("show-open-dialog", async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, options);
  return result;
});

ipcMain.handle("show-message-box", async (_, options) => {
  const result = await dialog.showMessageBox(mainWindow!, options);
  return result;
});

// Window control handlers
ipcMain.handle("minimize-window", () => {
  mainWindow?.minimize();
});

ipcMain.handle("maximize-window", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle("close-window", () => {
  mainWindow?.close();
});

// System information handlers
ipcMain.handle("get-system-info", () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.getSystemVersion(),
    memory: process.getSystemMemoryInfo(),
  };
});
