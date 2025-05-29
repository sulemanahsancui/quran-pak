import { useState, useEffect } from "react";
import { Surah, Ayah } from "../types/quran.ts";
import { quranService } from "../services/quranService.ts";

export const useQuran = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      const data = await quranService.getAllSurahs();
      setSurahs(data);
      setError(null);
    } catch (err) {
      setError("Failed to load surahs");
    } finally {
      setLoading(false);
    }
  };

  const loadSurah = async (number: number) => {
    try {
      setLoading(true);
      const data = await quranService.getSurahByNumber(number);
      if (data) {
        setCurrentSurah(data.surah);
        setAyahs(data.ayahs);
        setError(null);
      }
    } catch (err) {
      setError("Failed to load surah");
    } finally {
      setLoading(false);
    }
  };

  return {
    surahs,
    currentSurah,
    ayahs,
    loading,
    error,
    loadSurah,
  };
};
