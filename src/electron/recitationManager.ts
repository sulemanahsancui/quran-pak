import { app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MediaPlayer } from "./mediaPlayer.js";

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
  isPlaying: boolean;
}

class RecitationManager {
  private mainWindow: BrowserWindow;
  private settingsPath: string;
  private settings: RecitationSettings;
  private mediaPlayer: MediaPlayer;
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
    this.mediaPlayer = new MediaPlayer();

    // Set up media player event handlers
    this.mediaPlayer.on("play", () => {
      this.settings.isPlaying = true;
      this.updateSettings({ isPlaying: true });
    });

    this.mediaPlayer.on("pause", () => {
      this.settings.isPlaying = false;
      this.updateSettings({ isPlaying: false });
    });

    this.mediaPlayer.on("ended", () => {
      this.settings.isPlaying = false;
      this.updateSettings({ isPlaying: false });
    });

    // Apply initial settings
    this.mediaPlayer.setVolume(this.settings.volume);
    this.mediaPlayer.setPlaybackRate(this.settings.playbackSpeed);
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
      isPlaying: false,
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

    // Apply settings to media player
    if (newSettings.volume !== undefined) {
      this.mediaPlayer.setVolume(newSettings.volume);
    }
    if (newSettings.playbackSpeed !== undefined) {
      this.mediaPlayer.setPlaybackRate(newSettings.playbackSpeed);
    }

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
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciter.id}/${ayahNumber}.mp3`;
    console.log("RecitationManager: playAyah called with", {
      surahNumber,
      ayahNumber,
      audioUrl,
    });
    this.mediaPlayer.play(audioUrl);
  }

  playSurah(surahNumber: number) {
    const reciter = this.getCurrentReciter();
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciter.id}/${surahNumber}.mp3`;
    console.log("RecitationManager: playSurah called with", {
      surahNumber,
      audioUrl,
    });
    this.mediaPlayer.play(audioUrl);
  }

  pausePlayback() {
    console.log("RecitationManager: pausePlayback called");
    this.mediaPlayer.pause();
  }

  resumePlayback() {
    console.log("RecitationManager: resumePlayback called");
    this.mediaPlayer.resume();
  }

  stopPlayback() {
    console.log("RecitationManager: stopPlayback called");
    this.mediaPlayer.stop();
  }

  setVolume(volume: number) {
    this.updateSettings({ volume: Math.max(0, Math.min(1, volume)) });
  }

  setPlaybackSpeed(speed: number) {
    this.updateSettings({ playbackSpeed: Math.max(0.5, Math.min(2, speed)) });
  }
}

export default RecitationManager;
