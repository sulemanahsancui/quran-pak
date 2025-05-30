import { app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ReadingHistory {
  lastSurah: number;
  lastAyah: number;
  lastPage: number;
  timestamp: number;
}

class HistoryManager {
  private mainWindow: BrowserWindow;
  private historyPath: string;
  private history: ReadingHistory | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.historyPath = path.join(
      app.getPath("userData"),
      "reading-history.json"
    );
    console.log("History file path:", this.historyPath);
    this.history = this.loadHistory();
  }

  private loadHistory(): ReadingHistory | null {
    try {
      if (fs.existsSync(this.historyPath)) {
        const data = fs.readFileSync(this.historyPath, "utf-8");
        const history = JSON.parse(data);
        console.log("Loaded history:", history);
        return history;
      } else {
        console.log("No history file found at:", this.historyPath);
      }
    } catch (error) {
      console.error("Error loading reading history:", error);
    }
    return null;
  }

  private saveHistory() {
    try {
      if (this.history) {
        const data = JSON.stringify(this.history, null, 2);
        fs.writeFileSync(this.historyPath, data);
        console.log("Saved history:", this.history);
        // Notify renderer process of the update
        this.mainWindow.webContents.send(
          "reading-history-updated",
          this.history
        );
      }
    } catch (error) {
      console.error("Error saving reading history:", error);
    }
  }

  saveProgress(surahNumber: number, ayahNumber: number, pageNumber: number) {
    // Only save if we have valid numbers
    if (surahNumber > 0 && ayahNumber > 0 && pageNumber > 0) {
      console.log("Saving progress:", { surahNumber, ayahNumber, pageNumber });
      this.history = {
        lastSurah: surahNumber,
        lastAyah: ayahNumber,
        lastPage: pageNumber,
        timestamp: Date.now(),
      };
      this.saveHistory();
    } else {
      console.log("Invalid progress data:", {
        surahNumber,
        ayahNumber,
        pageNumber,
      });
    }
  }

  getLastProgress(): ReadingHistory | null {
    console.log("Getting last progress:", this.history);
    return this.history;
  }

  clearHistory() {
    console.log("Clearing history");
    this.history = null;
    try {
      if (fs.existsSync(this.historyPath)) {
        fs.unlinkSync(this.historyPath);
        console.log("History file deleted");
      }
    } catch (error) {
      console.error("Error clearing history file:", error);
    }
    this.mainWindow.webContents.send("reading-history-cleared");
  }
}

export default HistoryManager;
