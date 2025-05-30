import React, { useState, useEffect } from "react";

interface HistoryTabProps {
  onSurahSelect: (surahNumber: number) => void;
}

interface ReadingHistory {
  lastSurah: number;
  lastAyah: number;
  lastPage: number;
  timestamp: number;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onSurahSelect }) => {
  const [history, setHistory] = useState<ReadingHistory | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const progress = await window.electron?.history?.getLastProgress();
        console.log("Loaded history:", progress);
        setHistory(progress);
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };
    loadHistory();

    // Subscribe to history updates
    const unsubscribe = window.electron?.history?.onUpdated((newHistory) => {
      console.log("History updated:", newHistory);
      setHistory(newHistory);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  const handleClearHistory = async () => {
    try {
      await window.electron?.history?.clearHistory();
      setHistory(null);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  if (!history) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xl mb-2">No Reading History</p>
        <p className="text-sm text-center">
          Your reading progress will appear here once you start reading the
          Quran.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reading History</h2>
        <button
          onClick={handleClearHistory}
          className="text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Last Reading Position
            </h3>
            <p className="text-sm text-gray-500">
              {getTimeAgo(history.timestamp)}
            </p>
          </div>
          <button
            onClick={() => onSurahSelect(history.lastSurah)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <span>📖</span>
            <span>Resume Reading</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Surah</p>
            <p className="text-lg font-semibold text-gray-800">
              {history.lastSurah}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Ayah</p>
            <p className="text-lg font-semibold text-gray-800">
              {history.lastAyah}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Reading Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Last Read</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(history.timestamp).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Time Ago</p>
            <p className="text-lg font-semibold text-gray-800">
              {getTimeAgo(history.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
