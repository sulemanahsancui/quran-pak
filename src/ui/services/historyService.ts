interface ReadingHistory {
  lastSurah: number;
  lastAyah: number;
  timestamp: number;
}

class HistoryService {
  private readonly HISTORY_KEY = "quran_reading_history";

  saveProgress(surahNumber: number, ayahNumber: number): void {
    const history: ReadingHistory = {
      lastSurah: surahNumber,
      lastAyah: ayahNumber,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  getLastProgress(): ReadingHistory | null {
    console.log("Key", this.HISTORY_KEY);
    const history = localStorage.getItem(this.HISTORY_KEY);
    console.log({ history });
    if (!history) return null;
    return JSON.parse(history) as ReadingHistory;
  }

  clearHistory(): void {
    localStorage.removeItem(this.HISTORY_KEY);
  }
}

export const historyService = new HistoryService();
