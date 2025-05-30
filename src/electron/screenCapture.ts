import { app, BrowserWindow, desktopCapturer, dialog } from "electron";
import path from "path";
import fs from "fs";

class ScreenCaptureManager {
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  async captureScreen() {
    try {
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: 1920, height: 1080 },
      });

      if (sources.length === 0) {
        throw new Error("No screen sources found");
      }

      // Get the primary display
      const source = sources[0];
      const image = source.thumbnail.toPNG();

      // Show save dialog
      const { filePath } = await dialog.showSaveDialog(this.mainWindow, {
        title: "Save Screenshot",
        defaultPath: path.join(
          app.getPath("pictures"),
          `screenshot-${Date.now()}.png`
        ),
        filters: [{ name: "PNG", extensions: ["png"] }],
      });

      if (filePath) {
        fs.writeFileSync(filePath, image);
        return filePath;
      }

      return null;
    } catch (error) {
      console.error("Screen capture failed:", error);
      throw error;
    }
  }

  async captureWindow() {
    try {
      const image = await this.mainWindow.webContents.capturePage();
      const pngData = image.toPNG();

      // Show save dialog
      const { filePath } = await dialog.showSaveDialog(this.mainWindow, {
        title: "Save Window Screenshot",
        defaultPath: path.join(
          app.getPath("pictures"),
          `window-screenshot-${Date.now()}.png`
        ),
        filters: [{ name: "PNG", extensions: ["png"] }],
      });

      if (filePath) {
        fs.writeFileSync(filePath, pngData);
        return filePath;
      }

      return null;
    } catch (error) {
      console.error("Window capture failed:", error);
      throw error;
    }
  }

  async captureRegion(x: number, y: number, width: number, height: number) {
    try {
      const image = await this.mainWindow.webContents.capturePage({
        x,
        y,
        width,
        height,
      });
      const pngData = image.toPNG();

      // Show save dialog
      const { filePath } = await dialog.showSaveDialog(this.mainWindow, {
        title: "Save Region Screenshot",
        defaultPath: path.join(
          app.getPath("pictures"),
          `region-screenshot-${Date.now()}.png`
        ),
        filters: [{ name: "PNG", extensions: ["png"] }],
      });

      if (filePath) {
        fs.writeFileSync(filePath, pngData);
        return filePath;
      }

      return null;
    } catch (error) {
      console.error("Region capture failed:", error);
      throw error;
    }
  }
}

export default ScreenCaptureManager;
