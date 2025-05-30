import React, { useState, useEffect } from "react";
import { SurahList } from "../components/quran/SurahList.tsx";
import { SurahView } from "../components/quran/SurahView.tsx";
import { HistoryTab } from "../components/quran/HistoryTab.tsx";
import { PageView } from "../components/quran/PageView.tsx";
import { SearchBar } from "../components/quran/SearchBar.tsx";
import { SearchResults } from "../components/quran/SearchResults.tsx";
import { Navigation } from "../components/navigation.tsx";
import { Surah, Ayah } from "../types/quran.ts";
import { quranService } from "../services/quranService.ts";

type Tab = "surahs" | "history" | "page" | "search";

export const QuranPage: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("surahs");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchResults, setSearchResults] = useState<
    Array<{ type: "surah" | "ayah"; data: Surah | Ayah; surah?: Surah }>
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const data = await quranService.getAllSurahs();
        setSurahs(data);
      } catch (error) {
        console.error("Error fetching surahs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  useEffect(() => {
    // Set up tray event listeners
    window.electron?.tray.onGoToPosition((position) => {
      setCurrentPage(position.page);
      handlePageChange(position.page);
    });

    window.electron?.tray.onNavigatePage((delta) => {
      const newPage = currentPage + delta;
      if (newPage >= 1 && newPage <= 604) {
        setCurrentPage(newPage);
        handlePageChange(newPage);
      }
    });

    window.electron?.tray.onOpenSettings(() => {
      // TODO: Implement settings dialog
      console.log("Opening settings...");
    });

    // Clean up listeners
    return () => {
      // Note: The preload script handles cleanup of IPC listeners
    };
  }, [currentPage]);

  // Update last position when page changes
  useEffect(() => {
    window.electron?.tray.updateLastPosition(currentPage);
  }, [currentPage]);

  const handleSurahSelect = async (surahNumber: number) => {
    setLoadingAyahs(true);
    try {
      const result = await quranService.getSurahByNumber(surahNumber);
      if (result) {
        setSelectedSurah(result.surah);
        setAyahs(result.ayahs);
      }
    } catch (error) {
      console.error("Error loading surah:", error);
    } finally {
      setLoadingAyahs(false);
    }
  };

  const handlePageChange = async (pageNumber: number) => {
    setLoadingAyahs(true);
    try {
      setSelectedPage(pageNumber);
      const result = await quranService.getPage(pageNumber);
      if (result && result.ayahs) {
        setAyahs(result.ayahs);
      } else {
        console.error("No ayahs data received");
        setAyahs([]);
      }
    } catch (error) {
      console.error("Error loading page:", error);
      setAyahs([]);
    } finally {
      setLoadingAyahs(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Search in surahs
      const surahResults = surahs.filter(
        (surah) =>
          surah.name.toLowerCase().includes(query.toLowerCase()) ||
          surah.englishName.toLowerCase().includes(query.toLowerCase())
      );

      // Search in ayahs
      const ayahResults = await quranService.searchAyahs(query);

      // Combine and format results
      const results = [
        ...surahResults.map((surah) => ({
          type: "surah" as const,
          data: surah,
        })),
        ...ayahResults.map((ayah) => ({
          type: "ayah" as const,
          data: ayah,
          surah: surahs.find((s) => s.number === ayah.surahNumber),
        })),
      ];

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAyahSelect = async (surahNumber: number, ayahNumber: number) => {
    await handleSurahSelect(surahNumber);
    // TODO: Scroll to the specific ayah
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <Navigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 bg-background-light dark:bg-dark-background-light fixed h-[calc(100vh-64px)]">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab("surahs")}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === "surahs"
                    ? "text-primary dark:text-dark-primary border-b-2 border-primary dark:border-dark-primary"
                    : "text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary"
                }`}
              >
                Surahs
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === "history"
                    ? "text-primary dark:text-dark-primary border-b-2 border-primary dark:border-dark-primary"
                    : "text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary"
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab("page")}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === "page"
                    ? "text-primary dark:text-dark-primary border-b-2 border-primary dark:border-dark-primary"
                    : "text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary"
                }`}
              >
                Page
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === "search"
                    ? "text-primary dark:text-dark-primary border-b-2 border-primary dark:border-dark-primary"
                    : "text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary"
                }`}
              >
                Search
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-188px)]">
            {activeTab === "surahs" ? (
              <SurahList
                surahs={surahs}
                onSelectSurah={handleSurahSelect}
                loading={loading}
                selectedSurahNumber={selectedSurah?.number}
              />
            ) : activeTab === "history" ? (
              <HistoryTab onSurahSelect={handleSurahSelect} />
            ) : activeTab === "search" ? (
              <div className="p-4 space-y-4">
                <SearchBar onSearch={handleSearch} />
                <SearchResults
                  results={searchResults}
                  onSelectSurah={handleSurahSelect}
                  onSelectAyah={handleAyahSelect}
                  loading={searchLoading}
                />
              </div>
            ) : (
              <div className="p-4">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handlePageChange(selectedPage - 1)}
                    disabled={selectedPage <= 1}
                    className="px-4 py-2 bg-background dark:bg-dark-background text-text dark:text-dark-text rounded-lg hover:bg-background-dark dark:hover:bg-dark-background-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(selectedPage + 1)}
                    disabled={selectedPage >= 604}
                    className="px-4 py-2 bg-background dark:bg-dark-background text-text dark:text-dark-text rounded-lg hover:bg-background-dark dark:hover:bg-dark-background-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
                  >
                    Next
                  </button>
                </div>
                <div className="text-center text-text dark:text-dark-text">
                  Page {selectedPage} of 604
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-background dark:bg-dark-background ml-[25%]">
          {activeTab === "page" ? (
            <PageView
              pageNumber={selectedPage}
              ayahs={ayahs}
              loading={loadingAyahs}
              onPageChange={handlePageChange}
            />
          ) : selectedSurah ? (
            <SurahView
              surah={selectedSurah}
              ayahs={ayahs}
              loading={loadingAyahs}
              onSurahSelect={handleSurahSelect}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text dark:text-dark-text">
              <p>Select a surah to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
