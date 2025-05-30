import { clipboard, BrowserWindow, nativeImage } from "electron";

class ClipboardManager {
  private mainWindow: BrowserWindow;
  private history: string[] = [];
  private maxHistorySize: number = 10;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupClipboardMonitor();
  }

  private setupClipboardMonitor() {
    // Monitor clipboard changes
    setInterval(() => {
      const text = clipboard.readText();
      if (text && !this.history.includes(text)) {
        this.history.unshift(text);
        if (this.history.length > this.maxHistorySize) {
          this.history.pop();
        }
        this.mainWindow.webContents.send("clipboard-updated", this.history);
      }
    }, 1000);
  }

  public copyText(text: string) {
    clipboard.writeText(text);
    if (!this.history.includes(text)) {
      this.history.unshift(text);
      if (this.history.length > this.maxHistorySize) {
        this.history.pop();
      }
    }
    return true;
  }

  public pasteText(): string {
    return clipboard.readText();
  }

  public copyImage(imagePath: string) {
    const image = nativeImage.createFromPath(imagePath);
    if (!image.isEmpty()) {
      clipboard.writeImage(image);
      return true;
    }
    return false;
  }

  public pasteImage(): Electron.NativeImage {
    return clipboard.readImage();
  }

  public getHistory(): string[] {
    return [...this.history];
  }

  public clearHistory() {
    this.history = [];
    this.mainWindow.webContents.send("clipboard-updated", this.history);
  }

  public setMaxHistorySize(size: number) {
    this.maxHistorySize = size;
    while (this.history.length > this.maxHistorySize) {
      this.history.pop();
    }
  }
}

export default ClipboardManager;
