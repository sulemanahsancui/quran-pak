import React, { useState, useEffect } from "react";

interface ReadingHistoryProps {
  onSurahSelect: (surahNumber: number) => void;
}

interface ReadingHistory {
  lastSurah: number;
  lastAyah: number;
  lastPage: number;
  timestamp: number;
}

export const ReadingHistory: React.FC<ReadingHistoryProps> = ({
  onSurahSelect,
}) => {
  const [lastProgress, setLastProgress] = useState<ReadingHistory | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const progress = await window.electron?.history?.getLastProgress();
        console.log("Loaded history:", progress);
        setLastProgress(progress);
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };
    loadHistory();

    // Subscribe to history updates
    const unsubscribe = window.electron?.history?.onUpdated((newHistory) => {
      console.log("History updated:", newHistory);
      setLastProgress(newHistory);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  if (!lastProgress) {
    return null;
  }

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

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Reading History</h3>
        <span className="text-sm text-gray-500">
          {getTimeAgo(lastProgress.timestamp)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">
            Last read: Surah {lastProgress.lastSurah}, Ayah{" "}
            {lastProgress.lastAyah}
          </p>
        </div>
        <button
          onClick={() => onSurahSelect(lastProgress.lastSurah)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span>📖</span>
          <span>Resume</span>
        </button>
      </div>
    </div>
  );
};
