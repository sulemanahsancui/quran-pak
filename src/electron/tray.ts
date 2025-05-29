import { app, Tray, Menu, BrowserWindow, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);

class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;
  private lastReadPosition: { page: number } | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.createTray();
    this.setupGlobalShortcuts();
  }

  private createTray() {
    // Create tray icon
    const iconPath = path.join(process.cwd(), "src/assets/tray-icon.png");
    this.tray = new Tray(iconPath);

    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show Quran App",
        click: () => this.showWindow(),
        accelerator: "CmdOrCtrl+Shift+Q",
      },
      {
        label: "Last Read Position",
        click: () => this.goToLastPosition(),
        accelerator: "CmdOrCtrl+L",
      },
      { type: "separator" },
      {
        label: "Quick Actions",
        submenu: [
          {
            label: "Previous Page",
            click: () => this.navigatePage(-1),
            accelerator: "CmdOrCtrl+Left",
          },
          {
            label: "Next Page",
            click: () => this.navigatePage(1),
            accelerator: "CmdOrCtrl+Right",
          },
        ],
      },
      { type: "separator" },
      {
        label: "Settings",
        click: () => this.openSettings(),
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => app.quit(),
        accelerator: "CmdOrCtrl+Q",
      },
    ]);

    // Set tooltip
    this.tray.setToolTip("Quran App");

    // Set context menu
    this.tray.setContextMenu(contextMenu);

    // Handle click events
    this.tray.on("click", () => {
      this.showWindow();
    });
  }

  private setupGlobalShortcuts() {
    // Register global shortcuts
    globalShortcut.register("CmdOrCtrl+Shift+Q", () => this.showWindow());
    globalShortcut.register("CmdOrCtrl+L", () => this.goToLastPosition());
    globalShortcut.register("CmdOrCtrl+Left", () => this.navigatePage(-1));
    globalShortcut.register("CmdOrCtrl+Right", () => this.navigatePage(1));
  }

  private showWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isVisible()) {
        this.mainWindow.focus();
      } else {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    }
  }

  private goToLastPosition() {
    if (this.lastReadPosition) {
      this.mainWindow?.webContents.send(
        "go-to-position",
        this.lastReadPosition
      );
      this.showWindow();
    }
  }

  private navigatePage(delta: number) {
    this.mainWindow?.webContents.send("navigate-page", delta);
  }

  private openSettings() {
    this.mainWindow?.webContents.send("open-settings");
    this.showWindow();
  }

  public updateLastPosition(page: number) {
    this.lastReadPosition = { page };
  }

  public destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
    // Unregister all global shortcuts
    globalShortcut.unregisterAll();
  }
}

export default TrayManager;
