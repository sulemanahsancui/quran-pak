import { Surah, Ayah } from "../types/quran";

class QuranService {
  private readonly API_BASE = "https://api.alquran.cloud/v1";

  async getAllSurahs(): Promise<Surah[]> {
    const response = await fetch(`${this.API_BASE}/surah`);
    const data = await response.json();
    return data.data;
  }

  async getSurahByNumber(
    surahNumber: number
  ): Promise<{ surah: Surah; ayahs: Ayah[] } | null> {
    const response = await fetch(
      `${this.API_BASE}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`
    );
    const data = await response.json();

    if (!data.data || data.data.length < 2) {
      throw new Error("Failed to fetch surah data");
    }

    const arabicAyahs = data.data[0].ayahs;
    const englishAyahs = data.data[1].ayahs;
    const surahData = data.data[0].surah;

    const surah: Surah = {
      number: surahData.number,
      name: surahData.name,
      englishName: surahData.englishName,
      englishNameTranslation: surahData.englishNameTranslation,
      numberOfAyahs: surahData.numberOfAyahs,
      revelationType: surahData.revelationType,
    };

    const ayahs: Ayah[] = arabicAyahs.map((arabicAyah: any, index: number) => ({
      number: arabicAyah.number,
      numberInSurah: arabicAyah.numberInSurah,
      text: arabicAyah.text,
      translation: englishAyahs[index].text,
      surah,
    }));

    return { surah, ayahs };
  }

  async getPage(pageNumber: number): Promise<Ayah[]> {
    const response = await fetch(
      `${this.API_BASE}/page/${pageNumber}/editions/quran-uthmani,en.sahih`
    );
    const data = await response.json();

    if (!data.data || data.data.length < 2) {
      throw new Error("Failed to fetch page data");
    }

    const arabicAyahs = data.data[0].ayahs;
    const englishAyahs = data.data[1].ayahs;

    return arabicAyahs.map((arabicAyah: any, index: number) => ({
      number: arabicAyah.number,
      numberInSurah: arabicAyah.numberInSurah,
      text: arabicAyah.text,
      translation: englishAyahs[index].text,
      surah: {
        number: arabicAyah.surah.number,
        name: arabicAyah.surah.name,
        englishName: arabicAyah.surah.englishName,
        englishNameTranslation: arabicAyah.surah.englishNameTranslation,
        numberOfAyahs: arabicAyah.surah.numberOfAyahs,
        revelationType: arabicAyah.surah.revelationType,
      },
    }));
  }

  async getAudioUrl(edition: string = "ar.alafasy"): Promise<string> {
    return `https://cdn.islamic.network/quran/audio/128/${edition}`;
  }
}

export const quranService = new QuranService();
