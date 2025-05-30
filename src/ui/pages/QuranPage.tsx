import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookmarkPanel from "../components/quran/BookmarkPanel.js";
import RecitationControls from "../components/quran/RecitationControls.js";
import TranslationSettingsPanel from "../components/quran/TranslationSettings.js";
import { Bookmark } from "../types/quran.js";
import { SurahList } from "../components/quran/SurahList.js";
import { SurahView } from "../components/quran/SurahView.js";
import { HistoryTab } from "../components/quran/HistoryTab.js";
import { PageView } from "../components/quran/PageView.js";
import { SearchBar } from "../components/quran/SearchBar.js";
import { SearchResults } from "../components/quran/SearchResults.js";
import { Navigation } from "../components/navigation.js";
import { Surah, Ayah } from "../types/quran.js";
import { quranService } from "../services/quranService.js";

type Tab =
  | "surahs"
  | "history"
  | "page"
  | "search"
  | "bookmarks"
  | "recitation"
  | "settings";

export const QuranPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const data = await quranService.getAllSurahs();
        setSurahs(data);
      } catch (error) {
        console.error("Error loading surahs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSurahs();
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

  const handleAyahSelect = (surahNumber: number, ayahNumber: number) => {
    const surah = surahs.find((s) => s.number === surahNumber);
    if (surah) {
      setSelectedSurah(surah);
      const ayah = ayahs.find((a) => a.number === ayahNumber);
      if (ayah) {
        setAyahs([ayah]);
      }
    }
  };

  const handleSelectBookmark = (bookmark: Bookmark) => {
    setCurrentSurah(bookmark.surahNumber);
    setCurrentAyah(bookmark.ayahNumber);
    navigate(`/quran/${bookmark.surahNumber}/${bookmark.ayahNumber}`);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <Navigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        {/* Sidebar - Full height */}
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
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 bg-background dark:bg-dark-background text-text dark:text-dark-text rounded-lg hover:bg-background-dark dark:hover:bg-dark-background-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= 604}
                    className="px-4 py-2 bg-background dark:bg-dark-background text-text dark:text-dark-text rounded-lg hover:bg-background-dark dark:hover:bg-dark-background-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
                  >
                    Next
                  </button>
                </div>
                <div className="text-center text-text dark:text-dark-text">
                  Page {currentPage} of 604
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - With conditional footer */}
        <div className="flex-1 ml-[25%] flex flex-col min-h-[calc(100vh-64px)]">
          {activeTab === "page" ? (
            <PageView
              pageNumber={currentPage}
              ayahs={ayahs}
              loading={loadingAyahs}
              onPageChange={handlePageChange}
            />
          ) : selectedSurah ? (
            <div className="flex flex-col h-full">
              {/* Surah Content */}
              <div className="flex-1 overflow-y-auto pb-4">
                <SurahView
                  surah={selectedSurah}
                  ayahs={ayahs}
                  loading={loadingAyahs}
                  onSurahSelect={handleSurahSelect}
                />
              </div>

              {/* Bottom Panel - Fixed at bottom */}
              <div className="fixed bottom-0 left-[25%] right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                {/* Tab Navigation */}
                <div className="flex justify-center space-x-4 p-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    className={`px-4 py-2 rounded-md transition-colors ${
                      activeTab === "bookmarks"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("bookmarks")}
                  >
                    Bookmarks
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md transition-colors ${
                      activeTab === "recitation"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("recitation")}
                  >
                    Recitation
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md transition-colors ${
                      activeTab === "settings"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("settings")}
                  >
                    Settings
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 max-h-[300px] overflow-y-auto">
                  {activeTab === "bookmarks" && (
                    <BookmarkPanel onSelectBookmark={handleSelectBookmark} />
                  )}
                  {activeTab === "recitation" && <RecitationControls />}
                  {activeTab === "settings" && <TranslationSettingsPanel />}
                </div>
              </div>
            </div>
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

export default QuranPage;
