export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  timestamp: number;
  note?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  surahNumber: number;
  juz: number;
  page: number;
  sajdah?: boolean;
  sajdahNumber?: number;
}

export interface QuranData {
  surahs: Surah[];
  currentSurah?: Surah;
  currentAyah?: Ayah;
  audioUrl?: string;
}

export interface IslamicDate {
  date: string;
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface Location {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}
