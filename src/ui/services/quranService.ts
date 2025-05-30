import { Surah, Ayah } from "../types/quran.ts";

const BASE_URL = "https://api.alquran.cloud/v1";

interface PageResponse {
  ayahs: Ayah[];
}

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
      // Get Arabic text
      const arabicResponse = await fetch(
        `${BASE_URL}/surah/${number}/quran-uthmani`
      );
      const arabicData = await arabicResponse.json();

      // Get English translation
      const englishResponse = await fetch(
        `${BASE_URL}/surah/${number}/en.sahih`
      );
      const englishData = await englishResponse.json();

      if (!arabicData.data || !englishData.data) {
        throw new Error("Failed to fetch surah data");
      }

      const arabicAyahs = arabicData.data.ayahs;
      const englishAyahs = englishData.data.ayahs;

      // Create surah object from the API response
      const surah: Surah = {
        number: number, // Use the number parameter
        name: arabicData.data.name,
        englishName: arabicData.data.englishName,
        englishNameTranslation: arabicData.data.englishNameTranslation,
        numberOfAyahs: arabicData.data.numberOfAyahs,
        revelationType: arabicData.data.revelationType,
      };

      const ayahs: Ayah[] = arabicAyahs.map(
        (arabicAyah: any, index: number) => ({
          number: arabicAyah.number,
          numberInSurah: arabicAyah.numberInSurah,
          text: arabicAyah.text,
          translation: englishAyahs[index].text,
          juz: arabicAyah.juz,
          manzil: arabicAyah.manzil,
          page: arabicAyah.page,
          ruku: arabicAyah.ruku,
          hizbQuarter: arabicAyah.hizbQuarter,
          sajda: arabicAyah.sajda,
          surah: surah,
        })
      );

      return {
        surah,
        ayahs,
      };
    } catch (error) {
      console.error(`Error fetching surah ${number}:`, error);
      return null;
    }
  },

  async getAudioUrl(edition: string = "ar.alafasy"): Promise<string> {
    return `${BASE_URL}/edition/${edition}`;
  },

  async getPage(pageNumber: number): Promise<PageResponse | null> {
    try {
      // First get the Arabic text
      const arabicResponse = await fetch(
        `${BASE_URL}/page/${pageNumber}/quran-uthmani`
      );
      const arabicData = await arabicResponse.json();

      // Then get the English translation
      const englishResponse = await fetch(
        `${BASE_URL}/page/${pageNumber}/en.sahih`
      );
      const englishData = await englishResponse.json();

      if (!arabicData.data || !englishData.data) {
        throw new Error("Failed to fetch page data");
      }

      const arabicAyahs = arabicData.data.ayahs;
      const englishAyahs = englishData.data.ayahs;

      const ayahs: Ayah[] = arabicAyahs.map(
        (arabicAyah: any, index: number) => ({
          number: arabicAyah.number,
          numberInSurah: arabicAyah.numberInSurah,
          text: arabicAyah.text,
          translation: englishAyahs[index].text,
          juz: arabicAyah.juz,
          manzil: arabicAyah.manzil,
          page: arabicAyah.page,
          ruku: arabicAyah.ruku,
          hizbQuarter: arabicAyah.hizbQuarter,
          sajda: arabicAyah.sajda,
          surah: {
            number: arabicAyah.surah.number,
            name: arabicAyah.surah.name,
            englishName: arabicAyah.surah.englishName,
            englishNameTranslation: arabicAyah.surah.englishNameTranslation,
            numberOfAyahs: arabicAyah.surah.numberOfAyahs,
            revelationType: arabicAyah.surah.revelationType,
          },
        })
      );

      return { ayahs };
    } catch (error) {
      console.error("Error fetching page:", error);
      return null;
    }
  },

  async searchAyahs(query: string): Promise<Ayah[]> {
    try {
      // First, get all surahs to search through
      const surahs = await this.getAllSurahs();
      const results: Ayah[] = [];

      // Search through each surah
      for (const surah of surahs) {
        const surahData = await this.getSurahByNumber(surah.number);
        if (surahData) {
          const matchingAyahs = surahData.ayahs.filter((ayah) =>
            ayah.text.toLowerCase().includes(query.toLowerCase())
          );
          results.push(...matchingAyahs);
        }
      }

      return results;
    } catch (error) {
      console.error("Error searching ayahs:", error);
      throw error;
    }
  },
};
