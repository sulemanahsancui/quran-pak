import React, { useState, useRef, useEffect } from "react";
import { Surah, Ayah } from "../../types/quran.ts";
import { historyService } from "../../services/historyService.ts";
import { quranService } from "../../services/quranService.ts";
import { toast } from "react-hot-toast";

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
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [reciterName, setReciterName] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(
    new Set()
  );
  const [successStates, setSuccessStates] = useState<{
    [key: string]: boolean;
  }>({});

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
    const loadHistory = async () => {
      try {
        const progress = await window.electron?.history?.getLastProgress();
        console.log("Loaded history:", progress);
        if (progress) {
          setLastProgress({
            surah: progress.lastSurah,
            ayah: progress.lastAyah,
          });
        }
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };
    loadHistory();

    // Subscribe to history updates
    const unsubscribe = window.electron?.history?.onUpdated((newHistory) => {
      console.log("History updated:", newHistory);
      if (newHistory) {
        setLastProgress({
          surah: newHistory.lastSurah,
          ayah: newHistory.lastAyah,
        });
      }
    });

    return () => {
      unsubscribe?.();
    };
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

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const bookmarks = await window.electron?.bookmarks?.getBySurah(
          surah?.number
        );
        if (bookmarks) {
          const bookmarkedNumbers = new Set(
            bookmarks.map((bookmark) => bookmark.ayahNumber)
          );
          setBookmarkedAyahs(bookmarkedNumbers);
        }
      } catch (err) {
        console.error("Error loading bookmarks:", err);
      }
    };

    loadBookmarks();

    // Set up event listeners for bookmark changes
    const unsubscribeAdded = window.electron?.bookmarks?.onAdded((bookmark) => {
      if (bookmark.surahNumber === surah?.number) {
        setBookmarkedAyahs((prev) => new Set(prev).add(bookmark.ayahNumber));
      }
    });

    const unsubscribeRemoved = window.electron?.bookmarks?.onRemoved((id) => {
      // We need to check if this was a bookmark for an ayah in this surah
      const bookmark = ayahs.find((ayah) => ayah.id === id);
      if (bookmark) {
        setBookmarkedAyahs((prev) => {
          const next = new Set(prev);
          next.delete(bookmark.number);
          return next;
        });
      }
    });

    return () => {
      unsubscribeAdded?.();
      unsubscribeRemoved?.();
    };
  }, [surah?.number, ayahs]);

  useEffect(() => {
    const loadReciterName = async () => {
      try {
        const settings = await window.electron?.recitation?.getSettings();
        if (settings?.reciter) {
          setReciterName(settings.reciter.name);
        }
      } catch (err) {
        console.error("Error loading reciter name:", err);
      }
    };

    loadReciterName();
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!surah) return;

      // Space to play/pause current ayah
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        const currentAyah = ayahs.find((a) => a.number === playingAyah);
        if (currentAyah) {
          handlePlayAyah(currentAyah);
        }
      }

      // B to toggle bookmark for current ayah
      if (event.code === "KeyB" && !event.repeat) {
        event.preventDefault();
        const currentAyah = ayahs.find((a) => a.number === playingAyah);
        if (currentAyah) {
          handleBookmarkToggle(currentAyah);
        }
      }

      // Arrow keys to navigate between ayahs
      if (event.code === "ArrowDown" || event.code === "ArrowUp") {
        event.preventDefault();
        const currentIndex = ayahs.findIndex((a) => a.number === playingAyah);
        if (currentIndex === -1) return;

        const nextIndex =
          event.code === "ArrowDown"
            ? Math.min(currentIndex + 1, ayahs.length - 1)
            : Math.max(currentIndex - 1, 0);

        const nextAyah = ayahs[nextIndex];
        if (nextAyah) {
          handlePlayAyah(nextAyah);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [surah, ayahs, playingAyah]);

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

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: isLoading,
    }));
  };

  const setSuccess = (key: string, isSuccess: boolean) => {
    setSuccessStates((prev) => ({
      ...prev,
      [key]: isSuccess,
    }));
    // Reset success state after animation
    setTimeout(() => {
      setSuccessStates((prev) => ({
        ...prev,
        [key]: false,
      }));
    }, 1000);
  };

  const handleBookmarkToggle = async (ayah: Ayah) => {
    const key = `bookmark-${ayah.number}`;
    setLoading(key, true);
    try {
      if (bookmarkedAyahs.has(ayah.number)) {
        // Find the bookmark ID for this ayah
        const bookmarks = await window.electron?.bookmarks?.getBySurah(
          surah?.number
        );
        const bookmark = bookmarks?.find((b) => b.ayahNumber === ayah.number);
        if (bookmark) {
          await window.electron?.bookmarks?.remove(bookmark.id);
          setBookmarkedAyahs((prev) => {
            const next = new Set(prev);
            next.delete(ayah.number);
            return next;
          });
          toast.success("Bookmark removed");
        }
      } else {
        const bookmark = {
          surahNumber: surah?.number,
          surahName: surah?.name,
          ayahNumber: ayah.number,
          text: ayah.text,
        };
        await window.electron?.bookmarks?.add(bookmark);
        setBookmarkedAyahs((prev) => new Set(prev).add(ayah.number));
        toast.success("Bookmark added");
      }
      setSuccess(key, true);
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      toast.error("Failed to update bookmark");
    } finally {
      setLoading(key, false);
    }
  };

  const handlePlayAyah = async (ayah: Ayah) => {
    const key = `play-${ayah.number}`;
    setLoading(key, true);
    try {
      if (!surah?.number) {
        throw new Error("Surah number is required");
      }
      await window.electron?.recitation?.playAyah(surah.number, ayah.number);
      setSuccess(key, true);
      toast.success("Playing recitation");
    } catch (err) {
      console.error("Error playing ayah:", err);
      toast.error("Failed to play recitation");
    } finally {
      setLoading(key, false);
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
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-dark-primary"></div>
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
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-20 bg-background dark:bg-dark-background border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-text dark:text-dark-text mb-2">
                  {surah.englishName}
                </h1>
                <p className="text-text-dark dark:text-dark-text-dark">
                  {surah.englishNameTranslation}
                </p>
              </div>
              <div className="text-right">
                <p className="text-text-dark dark:text-dark-text-dark">
                  {surah.revelationType === "Meccan" ? "Meccan" : "Medinan"} •{" "}
                  {surah.numberOfAyahs} Verses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[120px] z-10 bg-background dark:bg-dark-background border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="p-6">
            <div className="bg-white dark:bg-dark-background-light rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-bold mb-2 text-text dark:text-dark-text">
                    {surah.englishName}
                  </h2>
                  <p className="text-xl text-text-dark dark:text-dark-text-dark mb-1">
                    {surah.englishNameTranslation}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-text-dark dark:text-dark-text-dark">
                    <span>Number of Ayahs: {surah.numberOfAyahs}</span>
                    <span>•</span>
                    <span>Revelation Type: {surah.revelationType}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={togglePlayFullSurah}
                    className="px-6 py-3 bg-primary dark:bg-dark-primary text-white rounded-lg hover:bg-primary-dark dark:hover:bg-dark-primary-dark transition-all transform hover:scale-105 flex items-center gap-2 shadow-md"
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
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            {ayahs.map((ayah) => (
              <div
                key={ayah.number}
                ref={(el) => {
                  if (el) ayahRefs.current.set(ayah.number, el);
                }}
                className={`bg-white dark:bg-dark-background-light rounded-xl shadow-md hover:shadow-lg transition-all p-6 ${
                  playingAyah === ayah.number
                    ? "ring-2 ring-primary dark:ring-dark-primary transform scale-[1.02]"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary px-3 py-1 rounded-full text-sm font-medium">
                      Ayah {ayah.numberInSurah}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Press Space to play • B to bookmark • ↑↓ to navigate
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePlayAyah(ayah)}
                      disabled={loadingStates[`play-${ayah.number}`]}
                      className={`p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors relative group ${
                        loadingStates[`play-${ayah.number}`]
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      } ${
                        successStates[`play-${ayah.number}`]
                          ? "animate-pulse"
                          : ""
                      }`}
                      title={`Play recitation${
                        reciterName ? ` (${reciterName})` : ""
                      }`}
                    >
                      {loadingStates[`play-${ayah.number}`] ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {reciterName
                          ? `Play (${reciterName})`
                          : "Play recitation"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleBookmarkToggle(ayah)}
                      disabled={loadingStates[`bookmark-${ayah.number}`]}
                      className={`p-2 transition-colors relative group ${
                        bookmarkedAyahs.has(ayah.number)
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400"
                      } ${
                        loadingStates[`bookmark-${ayah.number}`]
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      } ${
                        successStates[`bookmark-${ayah.number}`]
                          ? "animate-bounce"
                          : ""
                      }`}
                      title={
                        bookmarkedAyahs.has(ayah.number)
                          ? "Remove bookmark"
                          : "Add bookmark"
                      }
                    >
                      {loadingStates[`bookmark-${ayah.number}`] ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill={
                            bookmarkedAyahs.has(ayah.number)
                              ? "currentColor"
                              : "none"
                          }
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      )}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {bookmarkedAyahs.has(ayah.number)
                          ? "Remove bookmark"
                          : "Add bookmark"}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="text-3xl mb-4 font-arabic leading-loose text-text dark:text-dark-text">
                  {renderAyahText(ayah.text, ayah.number, ayah.numberInSurah)}
                </div>
                <div className="text-text-dark dark:text-dark-text-dark mt-4">
                  {ayah.translation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
