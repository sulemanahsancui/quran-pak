import {
  app,
  Tray,
  Menu,
  BrowserWindow,
  globalShortcut,
  nativeImage,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow;
  private lastPosition: { page: number } = { page: 1 };

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.createTray();
  }

  private createTray() {
    const icon = nativeImage.createFromPath(
      path.join(__dirname, "../assets/tray-icon.png")
    );
    this.tray = new Tray(icon);
    this.tray.setToolTip("Quran App");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Go to Last Position",
        click: () => this.goToLastPosition(),
      },
      {
        label: "Previous Page",
        click: () => this.navigatePage(-1),
      },
      {
        label: "Next Page",
        click: () => this.navigatePage(1),
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
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private goToLastPosition() {
    this.mainWindow?.webContents.send("go-to-position", this.lastPosition);
  }

  private navigatePage(delta: number) {
    this.mainWindow?.webContents.send("navigate-page", delta);
  }

  private openSettings() {
    this.mainWindow?.webContents.send("open-settings");
  }

  public updateLastPosition(page: number) {
    this.lastPosition = { page };
  }

  public destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

export default TrayManager;
