import React from "react";
import { Surah } from "../../types/quran.ts";

interface SurahListProps {
  surahs: Surah[];
  onSelectSurah: (number: number) => void;
  loading: boolean;
  selectedSurahNumber?: number;
}

export const SurahList: React.FC<SurahListProps> = ({
  surahs,
  onSelectSurah,
  loading,
  selectedSurahNumber,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Surahs</h2>
      <div className="grid gap-2">
        {surahs.map((surah) => (
          <button
            key={surah.number}
            onClick={() => onSelectSurah(surah.number)}
            className={`p-3 text-left hover:bg-gray-100 rounded-lg transition-all ${
              selectedSurahNumber === surah.number
                ? "bg-green-50 border border-green-200"
                : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  selectedSurahNumber === surah.number
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {surah.number}
              </span>
              <div>
                <h3 className="font-semibold">{surah.englishName}</h3>
                <p className="text-sm text-gray-600">
                  {surah.englishNameTranslation}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
