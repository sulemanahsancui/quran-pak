import { app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Reciter {
  id: string;
  name: string;
  language: string;
  style: string;
}

interface RecitationSettings {
  currentReciter: string;
  autoPlay: boolean;
  repeatCount: number;
  volume: number;
  playbackSpeed: number;
}

class RecitationManager {
  private mainWindow: BrowserWindow;
  private settingsPath: string;
  private settings: RecitationSettings;
  private reciters: Reciter[] = [
    {
      id: "mishary_rashid_alafasy",
      name: "Mishary Rashid Alafasy",
      language: "Arabic",
      style: "Modern",
    },
    {
      id: "abdul_basit",
      name: "Abdul Basit",
      language: "Arabic",
      style: "Traditional",
    },
    {
      id: "saad_al_ghamdi",
      name: "Saad Al-Ghamdi",
      language: "Arabic",
      style: "Modern",
    },
    // Add more reciters as needed
  ];

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.settingsPath = path.join(
      app.getPath("userData"),
      "recitation-settings.json"
    );
    this.settings = this.loadSettings();
  }

  private loadSettings(): RecitationSettings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, "utf-8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading recitation settings:", error);
    }

    // Default settings
    return {
      currentReciter: "mishary_rashid_alafasy",
      autoPlay: true,
      repeatCount: 1,
      volume: 1.0,
      playbackSpeed: 1.0,
    };
  }

  private saveSettings() {
    try {
      fs.writeFileSync(
        this.settingsPath,
        JSON.stringify(this.settings, null, 2)
      );
    } catch (error) {
      console.error("Error saving recitation settings:", error);
    }
  }

  getSettings(): RecitationSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<RecitationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.mainWindow.webContents.send(
      "recitation-settings-updated",
      this.settings
    );
  }

  getReciters(): Reciter[] {
    return [...this.reciters];
  }

  getCurrentReciter(): Reciter {
    return (
      this.reciters.find((r) => r.id === this.settings.currentReciter) ||
      this.reciters[0]
    );
  }

  playAyah(surahNumber: number, ayahNumber: number) {
    const reciter = this.getCurrentReciter();
    this.mainWindow.webContents.send("play-ayah", {
      surahNumber,
      ayahNumber,
      reciter: reciter.id,
      settings: this.settings,
    });
  }

  playSurah(surahNumber: number) {
    const reciter = this.getCurrentReciter();
    this.mainWindow.webContents.send("play-surah", {
      surahNumber,
      reciter: reciter.id,
      settings: this.settings,
    });
  }

  pausePlayback() {
    this.mainWindow.webContents.send("pause-playback");
  }

  resumePlayback() {
    this.mainWindow.webContents.send("resume-playback");
  }

  stopPlayback() {
    this.mainWindow.webContents.send("stop-playback");
  }

  setVolume(volume: number) {
    this.updateSettings({ volume: Math.max(0, Math.min(1, volume)) });
  }

  setPlaybackSpeed(speed: number) {
    this.updateSettings({ playbackSpeed: Math.max(0.5, Math.min(2, speed)) });
  }
}

export default RecitationManager;
