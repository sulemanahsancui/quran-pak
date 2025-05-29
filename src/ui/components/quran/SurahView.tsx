import React, { useState, useRef, useEffect } from "react";
import { Surah, Ayah } from "../../types/quran.ts";
import { historyService } from "../../services/historyService.ts";
import { quranService } from "../../services/quranService.ts";

interface SurahViewProps {
  surah: Surah | null;
  ayahs: Ayah[];
  loading: boolean;
  onSurahSelect: (surahNumber: number) => void;
}

export const SurahView: React.FC<SurahViewProps> = ({
  surah,
  ayahs,
  loading,
  onSurahSelect,
}) => {
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isPlayingFullSurah, setIsPlayingFullSurah] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [lastProgress, setLastProgress] = useState<{
    surah: number;
    ayah: number;
  } | null>(null);
  const [currentWord, setCurrentWord] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Scroll to the current ayah
  const scrollToAyah = (ayahNumber: number) => {
    const ayahElement = ayahRefs.current.get(ayahNumber);
    if (ayahElement) {
      ayahElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  useEffect(() => {
    const progress = historyService.getLastProgress();
    if (progress) {
      setLastProgress({ surah: progress.lastSurah, ayah: progress.lastAyah });
    }
  }, []);

  useEffect(() => {
    if (isPlayingFullSurah && ayahs.length > 0) {
      playNextAyah();
    }
  }, [isPlayingFullSurah, currentAyahIndex]);

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
      scrollToAyah(playingAyah);
    }
  }, [playingAyah]);

  const playNextAyah = async () => {
    if (currentAyahIndex >= ayahs.length) {
      setIsPlayingFullSurah(false);
      setCurrentAyahIndex(0);
      return;
    }

    const ayah = ayahs[currentAyahIndex];
    await playAyah(ayah.number, ayah.numberInSurah);
  };

  const playAyah = async (ayahNumber: number, ayahInSurah: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (playingAyah === ayahNumber && !isPlayingFullSurah) {
      setPlayingAyah(null);
      setCurrentWord(null);
      return;
    }

    const newAudio = new Audio(
      `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`
    );
    audioRef.current = newAudio;
    setPlayingAyah(ayahNumber);
    setCurrentWord(0);

    // Add event listeners for word timing
    newAudio.addEventListener("timeupdate", () =>
      handleTimeUpdate(ayahInSurah)
    );
    newAudio.addEventListener("ended", () => {
      setPlayingAyah(null);
      setCurrentWord(null);
      if (isPlayingFullSurah) {
        setCurrentAyahIndex((prev) => prev + 1);
      }
    });

    try {
      await newAudio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setPlayingAyah(null);
      setCurrentWord(null);
      if (isPlayingFullSurah) {
        setCurrentAyahIndex((prev) => prev + 1);
      }
    }
  };

  const handleTimeUpdate = (ayahInSurah: number) => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const ayah = ayahs.find((a) => a.numberInSurah === ayahInSurah);
    if (!ayah) return;

    const words = ayah.text.split(/\s+/);
    const totalDuration = audioRef.current.duration;
    const wordDuration = totalDuration / words.length;
    const currentWordIndex = Math.floor(currentTime / wordDuration);

    if (currentWordIndex !== currentWord && currentWordIndex < words.length) {
      setCurrentWord(currentWordIndex);
    }
  };

  const togglePlayFullSurah = () => {
    if (isPlayingFullSurah) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingFullSurah(false);
      setCurrentAyahIndex(0);
      setPlayingAyah(null);
      setCurrentWord(null);
    } else {
      setIsPlayingFullSurah(true);
      setCurrentAyahIndex(0);
    }
  };

  const handleAyahClick = (ayahNumber: number, ayahInSurah: number) => {
    if (surah) {
      historyService.saveProgress(surah.number, ayahInSurah);
    }
    playAyah(ayahNumber, ayahInSurah);
  };

  const handleResumeReading = () => {
    if (lastProgress) {
      onSurahSelect(lastProgress.surah);
    }
  };

  const renderAyahText = (
    text: string,
    ayahNumber: number,
    ayahInSurah: number
  ) => {
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

  if (!surah) {
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
        <p className="text-xl mb-4">Select a surah to begin</p>
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
              {surah.englishName}
            </h2>
            <p className="text-xl text-gray-600 mb-1">
              {surah.englishNameTranslation}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Number of Ayahs: {surah.numberOfAyahs}</span>
              <span>•</span>
              <span>Revelation Type: {surah.revelationType}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={togglePlayFullSurah}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 flex items-center gap-2 shadow-md"
            >
              {isPlayingFullSurah ? (
                <>
                  <span className="text-xl">⏸️</span>
                  <span>Pause Surah</span>
                </>
              ) : (
                <>
                  <span className="text-xl">▶️</span>
                  <span>Play Full Surah</span>
                </>
              )}
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
              </div>
              <button
                onClick={() => handleAyahClick(ayah.number, ayah.numberInSurah)}
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
              {renderAyahText(ayah.text, ayah.number, ayah.numberInSurah)}
            </div>
            <div className="text-gray-600 mt-4">{ayah.translation}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
