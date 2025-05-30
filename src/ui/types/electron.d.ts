interface ElectronAPI {
  tray: {
    onGoToPosition: (callback: (position: { page: number }) => void) => void;
    onNavigatePage: (callback: (delta: number) => void) => void;
    onOpenSettings: (callback: () => void) => void;
    updateLastPosition: (page: number) => void;
  };
}

interface Reciter {
  id: string;
  name: string;
  language: string;
  style: string;
}

interface RecitationSettings {
  currentReciter: string;
  volume: number;
  playbackSpeed: number;
  repeatCount: number;
  autoPlay: boolean;
  isPlaying: boolean;
}

interface Translation {
  id: string;
  name: string;
  language: string;
  author: string;
}

interface TranslationSettings {
  primaryTranslation: string;
  secondaryTranslation: string | null;
  showArabic: boolean;
  showTransliteration: boolean;
  fontSize: number;
  lineSpacing: number;
}

declare global {
  interface Window {
    electron: ElectronAPI & {
      bookmarks: {
        getAll: () => Promise<any[]>;
        getBySurah: (surahNumber: number) => Promise<any[]>;
        add: (bookmark: any) => void;
        remove: (id: string) => void;
        updateNote: (id: string, note: string) => void;
        clearAll: () => void;
        onAdded: (callback: (bookmark: any) => void) => () => void;
        onRemoved: (callback: (id: string) => void) => () => void;
        onUpdated: (callback: (bookmark: any) => void) => () => void;
      };
      recitation: {
        getSettings: () => Promise<RecitationSettings>;
        updateSettings: (
          settings: Partial<RecitationSettings>
        ) => Promise<void>;
        getReciters: () => Promise<Reciter[]>;
        playAyah: (surahNumber: number, ayahNumber: number) => Promise<void>;
        playSurah: (surahNumber: number) => Promise<void>;
        pause: () => Promise<void>;
        resume: () => Promise<void>;
        stop: () => Promise<void>;
        onSettingsUpdated: (
          callback: (settings: RecitationSettings) => void
        ) => () => void;
      };
      translation: {
        getSettings: () => Promise<TranslationSettings>;
        updateSettings: (
          settings: Partial<TranslationSettings>
        ) => Promise<void>;
        getTranslations: () => Promise<Translation[]>;
        setPrimaryTranslation: (id: string) => Promise<void>;
        setSecondaryTranslation: (id: string | null) => Promise<void>;
        toggleArabic: () => Promise<void>;
        toggleTransliteration: () => Promise<void>;
        setFontSize: (size: number) => Promise<void>;
        setLineSpacing: (spacing: number) => Promise<void>;
        onSettingsUpdated: (
          callback: (settings: TranslationSettings) => void
        ) => () => void;
      };
    };
  }
}
