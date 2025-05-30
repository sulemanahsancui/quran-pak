import { app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Translation {
  id: string;
  name: string;
  language: string;
  author: string;
  source: string;
}

interface TranslationSettings {
  primaryTranslation: string;
  secondaryTranslation: string | null;
  showArabic: boolean;
  showTransliteration: boolean;
  fontSize: number;
  lineSpacing: number;
}

class TranslationManager {
  private mainWindow: BrowserWindow;
  private settingsPath: string;
  private settings: TranslationSettings;
  private translations: Translation[] = [
    {
      id: "en_sahih",
      name: "Sahih International",
      language: "English",
      author: "Saheeh International",
      source: "https://quran.com",
    },
    {
      id: "en_pickthall",
      name: "Pickthall",
      language: "English",
      author: "Mohammed Marmaduke Pickthall",
      source: "https://quran.com",
    },
    {
      id: "ur_ahmed_ali",
      name: "Ahmed Ali",
      language: "Urdu",
      author: "Ahmed Ali",
      source: "https://quran.com",
    },
    {
      id: "bn_bengali",
      name: "Bengali",
      language: "Bengali",
      author: "Zohurul Hoque",
      source: "https://quran.com",
    },
    // Add more translations as needed
  ];

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.settingsPath = path.join(
      app.getPath("userData"),
      "translation-settings.json"
    );
    this.settings = this.loadSettings();
  }

  private loadSettings(): TranslationSettings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, "utf-8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading translation settings:", error);
    }

    // Default settings
    return {
      primaryTranslation: "en_sahih",
      secondaryTranslation: null,
      showArabic: true,
      showTransliteration: false,
      fontSize: 16,
      lineSpacing: 1.5,
    };
  }

  private saveSettings() {
    try {
      fs.writeFileSync(
        this.settingsPath,
        JSON.stringify(this.settings, null, 2)
      );
    } catch (error) {
      console.error("Error saving translation settings:", error);
    }
  }

  getSettings(): TranslationSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<TranslationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.mainWindow.webContents.send(
      "translation-settings-updated",
      this.settings
    );
  }

  getTranslations(): Translation[] {
    return [...this.translations];
  }

  getTranslationById(id: string): Translation | undefined {
    return this.translations.find((t) => t.id === id);
  }

  getPrimaryTranslation(): Translation {
    return (
      this.getTranslationById(this.settings.primaryTranslation) ||
      this.translations[0]
    );
  }

  getSecondaryTranslation(): Translation | null {
    if (!this.settings.secondaryTranslation) {
      return null;
    }
    return this.getTranslationById(this.settings.secondaryTranslation) ?? null;
  }

  setPrimaryTranslation(id: string) {
    if (this.translations.some((t) => t.id === id)) {
      this.updateSettings({ primaryTranslation: id });
    }
  }

  setSecondaryTranslation(id: string | null) {
    if (id === null || this.translations.some((t) => t.id === id)) {
      this.updateSettings({ secondaryTranslation: id });
    }
  }

  toggleArabic() {
    this.updateSettings({ showArabic: !this.settings.showArabic });
  }

  toggleTransliteration() {
    this.updateSettings({
      showTransliteration: !this.settings.showTransliteration,
    });
  }

  setFontSize(size: number) {
    this.updateSettings({ fontSize: Math.max(12, Math.min(24, size)) });
  }

  setLineSpacing(spacing: number) {
    this.updateSettings({ lineSpacing: Math.max(1, Math.min(2, spacing)) });
  }
}

export default TranslationManager;
