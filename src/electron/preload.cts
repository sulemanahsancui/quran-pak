import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  isMaximized: () => ipcRenderer.invoke("window-is-maximized"),

  navigate: (path: any) => ipcRenderer.send("navigate", path),
  goBack: () => ipcRenderer.send("go-back"),
  goForward: () => ipcRenderer.send("go-forward"),

  getTheme: () => ipcRenderer.invoke("get-theme"),
  setTheme: (theme: any) => ipcRenderer.send("set-theme", theme),

  showNotification: (title: any, body: any, options: any) =>
    ipcRenderer.send("show-notification", { title, body, options }),
  enableNotifications: () => ipcRenderer.send("enable-notifications"),
  disableNotifications: () => ipcRenderer.send("disable-notifications"),

  captureScreen: () => ipcRenderer.invoke("capture-screen"),
  captureWindow: () => ipcRenderer.invoke("capture-window"),
  captureRegion: (x: any, y: any, width: any, height: any) =>
    ipcRenderer.invoke("capture-region", { x, y, width, height }),

  copyText: (text: any) => ipcRenderer.send("copy-text", text),
  pasteText: () => ipcRenderer.invoke("paste-text"),
  copyImage: (imagePath: any) => ipcRenderer.send("copy-image", imagePath),
  pasteImage: () => ipcRenderer.invoke("paste-image"),
  getClipboardHistory: () => ipcRenderer.invoke("get-clipboard-history"),
  clearClipboardHistory: () => ipcRenderer.send("clear-clipboard-history"),

  getSystemIdleTime: () => ipcRenderer.invoke("get-system-idle-time"),
  isOnBatteryPower: () => ipcRenderer.invoke("is-on-battery-power"),

  on: (channel: any, callback: any) => {
    const validChannels = [
      "window-maximized",
      "window-unmaximized",
      "theme-changed",
      "notification-clicked",
      "clipboard-updated",
      "system-suspend",
      "system-resume",
      "system-lock",
      "system-unlock",
      "power-status",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, data) => callback(data));
    }
  },

  removeListener: (channel: any, callback: any) => {
    const validChannels = [
      "window-maximized",
      "window-unmaximized",
      "theme-changed",
      "notification-clicked",
      "clipboard-updated",
      "system-suspend",
      "system-resume",
      "system-lock",
      "system-unlock",
      "power-status",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },

  dialog: {
    showOpenDialog: (options: any) =>
      ipcRenderer.invoke("show-open-dialog", options),
    showSaveDialog: (options: any) =>
      ipcRenderer.invoke("show-save-dialog", options),
    showMessageBox: (options: any) =>
      ipcRenderer.invoke("show-message-box", options),
  },

  fs: {
    getAppPath: () => ipcRenderer.invoke("get-app-path"),
  },

  system: {
    getInfo: () => ipcRenderer.invoke("get-system-info"),
  },

  tray: {
    onGoToPosition: (callback: any) => {
      const handler = (_event: any, position: any) => callback(position);
      ipcRenderer.on("go-to-position", handler);
      return () => ipcRenderer.removeListener("go-to-position", handler);
    },
    onNavigatePage: (callback: any) => {
      const handler = (_event: any, delta: any) => callback(delta);
      ipcRenderer.on("navigate-page", handler);
      return () => ipcRenderer.removeListener("navigate-page", handler);
    },
    onOpenSettings: (callback: any) => {
      const handler = () => callback();
      ipcRenderer.on("open-settings", handler);
      return () => ipcRenderer.removeListener("open-settings", handler);
    },
    updateLastPosition: (page: any) => {
      ipcRenderer.send("update-last-position", page);
    },
  },

  history: {
    getLastProgress: () => ipcRenderer.invoke("get-reading-history"),
    saveProgress: (
      surahNumber: number,
      ayahNumber: number,
      pageNumber: number
    ) =>
      ipcRenderer.send("save-reading-progress", {
        surahNumber,
        ayahNumber,
        pageNumber,
      }),
    clearHistory: () => ipcRenderer.send("clear-reading-history"),
    onUpdated: (callback: (history: any) => void) => {
      const handler = (_event: any, history: any) => callback(history);
      ipcRenderer.on("reading-history-updated", handler);
      return () =>
        ipcRenderer.removeListener("reading-history-updated", handler);
    },
    onCleared: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on("reading-history-cleared", handler);
      return () =>
        ipcRenderer.removeListener("reading-history-cleared", handler);
    },
  },

  recitation: {
    getSettings: () => ipcRenderer.invoke("get-recitation-settings"),
    updateSettings: (settings: any) =>
      ipcRenderer.send("update-recitation-settings", settings),
    getReciters: () => ipcRenderer.invoke("get-reciters"),
    playAyah: (surahNumber: number, ayahNumber: number) =>
      ipcRenderer.send("play-ayah", { surahNumber, ayahNumber }),
    playSurah: (surahNumber: number) =>
      ipcRenderer.send("play-surah", { surahNumber }),
    pause: () => ipcRenderer.send("pause-playback"),
    resume: () => ipcRenderer.send("resume-playback"),
    stop: () => ipcRenderer.send("stop-playback"),
    onSettingsUpdated: (callback: (settings: any) => void) => {
      const handler = (_event: any, settings: any) => callback(settings);
      ipcRenderer.on("recitation-settings-updated", handler);
      return () =>
        ipcRenderer.removeListener("recitation-settings-updated", handler);
    },
  },

  bookmarks: {
    getAll: () => ipcRenderer.invoke("get-all-bookmarks"),
    getBySurah: (surahNumber: number) =>
      ipcRenderer.invoke("get-bookmarks-by-surah", surahNumber),
    add: (bookmark: any) => ipcRenderer.send("add-bookmark", bookmark),
    remove: (id: string) => ipcRenderer.send("remove-bookmark", id),
    updateNote: (id: string, note: string) =>
      ipcRenderer.send("update-bookmark-note", { id, note }),
    clearAll: () => ipcRenderer.send("clear-all-bookmarks"),
    onAdded: (callback: (bookmark: any) => void) => {
      const handler = (_event: any, bookmark: any) => callback(bookmark);
      ipcRenderer.on("bookmark-added", handler);
      return () => ipcRenderer.removeListener("bookmark-added", handler);
    },
    onRemoved: (callback: (id: string) => void) => {
      const handler = (_event: any, id: string) => callback(id);
      ipcRenderer.on("bookmark-removed", handler);
      return () => ipcRenderer.removeListener("bookmark-removed", handler);
    },
    onUpdated: (callback: (bookmark: any) => void) => {
      const handler = (_event: any, bookmark: any) => callback(bookmark);
      ipcRenderer.on("bookmark-updated", handler);
      return () => ipcRenderer.removeListener("bookmark-updated", handler);
    },
  },

  translation: {
    getSettings: () => ipcRenderer.invoke("get-translation-settings"),
    updateSettings: (settings: any) =>
      ipcRenderer.send("update-translation-settings", settings),
    getTranslations: () => ipcRenderer.invoke("get-translations"),
    setPrimaryTranslation: (id: string) =>
      ipcRenderer.send("set-primary-translation", id),
    setSecondaryTranslation: (id: string | null) =>
      ipcRenderer.send("set-secondary-translation", id),
    toggleArabic: () => ipcRenderer.send("toggle-arabic"),
    toggleTransliteration: () => ipcRenderer.send("toggle-transliteration"),
    setFontSize: (size: number) => ipcRenderer.send("set-font-size", size),
    setLineSpacing: (spacing: number) =>
      ipcRenderer.send("set-line-spacing", spacing),
    onSettingsUpdated: (callback: (settings: any) => void) => {
      const handler = (_event: any, settings: any) => callback(settings);
      ipcRenderer.on("translation-settings-updated", handler);
      return () =>
        ipcRenderer.removeListener("translation-settings-updated", handler);
    },
  },

  window: {
    minimize: () => ipcRenderer.send("minimize-window"),
    maximize: () => ipcRenderer.send("maximize-window"),
    close: () => ipcRenderer.send("close-window"),
  },

  notifications: {
    show: (options: any) => ipcRenderer.send("show-notification", options),
    showPrayerTime: (prayerName: string, time: string) =>
      ipcRenderer.send("show-prayer-notification", { prayerName, time }),
    showBookmark: (surahName: string, ayahNumber: number) =>
      ipcRenderer.send("show-bookmark-notification", { surahName, ayahNumber }),
  },
});
