import React from "react";
import { Ayah, Surah } from "../../types/quran.ts";

interface SearchResult {
  type: "surah" | "ayah";
  data: Surah | Ayah;
  surah?: Surah;
}

interface SearchResultsProps {
  results: SearchResult[];
  onSelectSurah: (surahNumber: number) => void;
  onSelectAyah: (surahNumber: number, ayahNumber: number) => void;
  loading?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onSelectSurah,
  onSelectAyah,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-dark-primary"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-text-dark dark:text-dark-text-dark">
        No results found
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {results.map((result, index) => (
        <div
          key={`${result.type}-${index}`}
          className="p-4 hover:bg-background dark:hover:bg-dark-background transition-colors cursor-pointer"
          onClick={() => {
            if (result.type === "surah") {
              onSelectSurah((result.data as Surah).number);
            } else {
              const ayah = result.data as Ayah;
              onSelectAyah(ayah.surahNumber, ayah.numberInSurah);
            }
          }}
        >
          {result.type === "surah" ? (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text dark:text-dark-text">
                  {(result.data as Surah).name}
                </h3>
                <span className="text-sm text-text-dark dark:text-dark-text-dark">
                  Surah {(result.data as Surah).number}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-dark dark:text-dark-text-dark">
                {(result.data as Surah).englishName}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text dark:text-dark-text">
                  {result.surah?.name} - Ayah{" "}
                  {(result.data as Ayah).numberInSurah}
                </h3>
                <span className="text-sm text-text-dark dark:text-dark-text-dark">
                  Page {(result.data as Ayah).page}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-dark dark:text-dark-text-dark">
                {(result.data as Ayah).text}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
