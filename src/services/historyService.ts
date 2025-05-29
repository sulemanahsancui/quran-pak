interface ReadingProgress {
  lastSurah?: number;
  lastAyah?: number;
  lastPage?: number;
  lastReadAt: string;
}

class HistoryService {
  private readonly STORAGE_KEY = "quran_reading_progress";

  saveProgress(
    surahNumber: number | null,
    ayahNumber: number | null,
    pageNumber?: number
  ) {
    const progress: ReadingProgress = {
      lastSurah: surahNumber || undefined,
      lastAyah: ayahNumber || undefined,
      lastPage: pageNumber,
      lastReadAt: new Date().toISOString(),
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }

  getLastProgress(): ReadingProgress | null {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  clearProgress() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const historyService = new HistoryService();
