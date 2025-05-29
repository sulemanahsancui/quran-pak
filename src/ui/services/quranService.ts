import { Surah, Ayah } from "../types/quran.ts";

const BASE_URL = "https://api.alquran.cloud/v1";

export const quranService = {
  async getAllSurahs(): Promise<Surah[]> {
    try {
      const response = await fetch(`${BASE_URL}/surah`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching surahs:", error);
      return [];
    }
  },

  async getSurahByNumber(
    number: number
  ): Promise<{ surah: Surah; ayahs: Ayah[] } | null> {
    try {
      const response = await fetch(`${BASE_URL}/surah/${number}`);
      const data = await response.json();
      return {
        surah: data.data,
        ayahs: data.data.ayahs,
      };
    } catch (error) {
      console.error(`Error fetching surah ${number}:`, error);
      return null;
    }
  },

  async getAudioUrl(edition: string = "ar.alafasy"): Promise<string> {
    return `${BASE_URL}/edition/${edition}`;
  },
};
