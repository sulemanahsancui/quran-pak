import React, { useEffect, useRef, useState } from "react";
import { Ayah } from "../../types/quran";

interface PageViewProps {
  pageNumber: number;
  ayahs: Ayah[];
  loading: boolean;
  onPageChange: (pageNumber: number) => void;
}

export const PageView: React.FC<PageViewProps> = ({
  pageNumber,
  ayahs,
  loading,
  onPageChange,
}) => {
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [currentWord, setCurrentWord] = useState<number | null>(null);
  const [lastProgress, setLastProgress] = useState<{ page: number } | null>(
    null
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const loadLastProgress = async () => {
      try {
        console.log("Loading last progress...");
        const progress = await window.electron?.history?.getLastProgress();
        console.log("Loaded progress:", progress);
        if (progress?.lastPage) {
          setLastProgress({ page: progress.lastPage });
          // If we're on page 1 and have history, navigate to the last page
          if (pageNumber === 1) {
            onPageChange(progress.lastPage);
          }
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };
    loadLastProgress();

    // Subscribe to history updates
    const unsubscribe = window.electron?.history?.onUpdated((history) => {
      console.log("History updated:", history);
      if (history?.lastPage) {
        setLastProgress({ page: history.lastPage });
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    // Save progress when page changes
    if (ayahs.length > 0 && pageNumber > 0) {
      const surahNumber = ayahs[0]?.surah?.number;
      const ayahNumber = ayahs[0]?.number;

      if (surahNumber && ayahNumber) {
        console.log("Saving progress:", {
          surahNumber,
          ayahNumber,
          pageNumber,
        });
        window.electron?.history?.saveProgress(
          surahNumber,
          ayahNumber,
          pageNumber
        );
      }
    }
  }, [pageNumber, ayahs]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Scroll to playing ayah when it changes
  useEffect(() => {
    if (playingAyah !== null) {
      const ayahElement = ayahRefs.current.get(playingAyah);
      if (ayahElement) {
        ayahElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [playingAyah]);

  const playAyah = async (ayahNumber: number) => {
    if (playingAyah === ayahNumber) {
      await window.electron?.recitation?.pause();
      setPlayingAyah(null);
      setCurrentWord(null);
      return;
    }

    try {
      const surahNumber = ayahs.find((a) => a.number === ayahNumber)?.surah
        ?.number;
      if (!surahNumber) return;

      await window.electron?.recitation?.playAyah(surahNumber, ayahNumber);
      setPlayingAyah(ayahNumber);
      setCurrentWord(0);

      // Subscribe to recitation events
      const unsubscribe = window.electron?.recitation?.onSettingsUpdated(
        (settings) => {
          if (!settings.isPlaying) {
            setPlayingAyah(null);
            setCurrentWord(null);
          }
        }
      );

      return () => unsubscribe?.();
    } catch (error) {
      console.error("Error playing ayah:", error);
      setPlayingAyah(null);
      setCurrentWord(null);
    }
  };

  const handleAyahClick = (ayahNumber: number) => {
    playAyah(ayahNumber);
  };

  const handleResumeReading = () => {
    if (lastProgress) {
      onPageChange(lastProgress.page);
    }
  };

  const renderAyahText = (text: string, ayahNumber: number) => {
    const words = text.split(/\s+/);
    return (
      <div className="rtl text-right" dir="rtl">
        {words.map((word, index) => {
          const wordKey = `${ayahNumber}-${index}`;
          return (
            <span
              key={wordKey}
              ref={(el) => {
                if (el) wordRefs.current.set(wordKey, el);
              }}
              className={`inline-block px-1 rounded transition-colors duration-200 ${
                currentWord === index && playingAyah === ayahNumber
                  ? "bg-green-100 text-green-800"
                  : ""
              }`}
            >
              {word}{" "}
            </span>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!ayahs.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-xl mb-4">Select a page to begin</p>
        {lastProgress && (
          <button
            onClick={handleResumeReading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <span>📖</span>
            <span>Resume Reading</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-4xl font-bold mb-2 text-gray-800">
              Page {pageNumber}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Number of Ayahs: {ayahs.length}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Page
            </button>
            <button
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber >= 604}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Page
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {ayahs.map((ayah) => (
          <div
            key={ayah.number}
            ref={(el) => {
              if (el) ayahRefs.current.set(ayah.number, el);
            }}
            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 ${
              playingAyah === ayah.number
                ? "ring-2 ring-green-500 transform scale-[1.02]"
                : ""
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Ayah {ayah.numberInSurah}
                </span>
                {ayah.surah && (
                  <span className="text-gray-500 text-sm">
                    Surah {ayah.surah.number}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleAyahClick(ayah.number)}
                className="p-2 text-green-500 hover:text-green-600 transition-colors"
              >
                {playingAyah === ayah.number ? (
                  <span className="text-2xl">⏸️</span>
                ) : (
                  <span className="text-2xl">▶️</span>
                )}
              </button>
            </div>
            <div className="text-3xl mb-4 font-arabic leading-loose">
              {renderAyahText(ayah.text, ayah.number)}
            </div>
            <div className="text-gray-600 mt-4">{ayah.translation}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
