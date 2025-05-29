import React, { useState, useEffect } from "react";
import { SurahList } from "../components/quran/SurahList.tsx";
import { SurahView } from "../components/quran/SurahView.tsx";
import { HistoryTab } from "../components/quran/HistoryTab.tsx";
import { PageView } from "../components/quran/PageView.tsx";
import { Navigation } from "../components/Navigation.tsx";
import { Surah, Ayah } from "../types/quran.ts";
import { quranService } from "../services/quranService.ts";

type Tab = "surahs" | "history" | "page";

export const QuranPage: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("surahs");
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("surahs")}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === "surahs"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Surahs
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === "history"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab("page")}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === "page"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Page
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-112px)]">
            {activeTab === "surahs" ? (
              <SurahList
                surahs={surahs}
                onSelectSurah={handleSurahSelect}
                loading={loading}
                selectedSurahNumber={selectedSurah?.number}
              />
            ) : activeTab === "history" ? (
              <HistoryTab onSurahSelect={handleSurahSelect} />
            ) : (
              <div className="p-4">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handlePageChange(selectedPage - 1)}
                    disabled={selectedPage <= 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(selectedPage + 1)}
                    disabled={selectedPage >= 604}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="text-center text-gray-600">
                  Page {selectedPage} of 604
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
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
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a surah to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
