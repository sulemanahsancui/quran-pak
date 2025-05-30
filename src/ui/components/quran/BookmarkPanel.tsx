import React, { useEffect, useState } from "react";
import { Bookmark } from "../../types/quran.ts";

interface BookmarkPanelProps {
  onSelectBookmark: (bookmark: Bookmark) => void;
}

const BookmarkPanel: React.FC<BookmarkPanelProps> = ({ onSelectBookmark }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load bookmarks on mount
    loadBookmarks();

    // Set up event listeners
    const unsubscribeAdded = window.electron?.bookmarks?.onAdded(
      (bookmark: Bookmark) => {
        setBookmarks((prev) => [bookmark, ...prev]);
      }
    );

    const unsubscribeRemoved = window.electron?.bookmarks?.onRemoved(
      (id: string) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      }
    );

    const unsubscribeUpdated = window.electron?.bookmarks?.onUpdated(
      (bookmark: Bookmark) => {
        setBookmarks((prev) =>
          prev.map((b) => (b.id === bookmark.id ? bookmark : b))
        );
      }
    );

    return () => {
      unsubscribeAdded?.();
      unsubscribeRemoved?.();
      unsubscribeUpdated?.();
    };
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const allBookmarks = await window.electron?.bookmarks?.getAll();
      setBookmarks(allBookmarks || []);
    } catch (err) {
      console.error("Error loading bookmarks:", err);
      setError("Failed to load bookmarks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (id: string) => {
    try {
      await window.electron?.bookmarks?.remove(id);
    } catch (err) {
      console.error("Error removing bookmark:", err);
      setError("Failed to remove bookmark. Please try again.");
    }
  };

  const handleUpdateNote = async (id: string, note: string) => {
    try {
      await window.electron?.bookmarks?.updateNote(id, note);
    } catch (err) {
      console.error("Error updating bookmark note:", err);
      setError("Failed to update bookmark note. Please try again.");
    }
  };

  const filteredBookmarks = selectedSurah
    ? bookmarks.filter((b) => b.surahNumber === selectedSurah)
    : bookmarks;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Loading bookmarks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={loadBookmarks}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Bookmarks
        </h2>
        <div className="flex space-x-2">
          <select
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={selectedSurah || ""}
            onChange={(e) =>
              setSelectedSurah(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">All Surahs</option>
            {Array.from(new Set(bookmarks.map((b) => b.surahNumber))).map(
              (surahNumber) => (
                <option key={surahNumber} value={surahNumber}>
                  Surah {surahNumber}
                </option>
              )
            )}
          </select>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            onClick={() => window.electron?.bookmarks?.clearAll()}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {filteredBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {bookmark.surahName} - Ayah {bookmark.ayahNumber}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {bookmark.text}
                </p>
                {bookmark.note && (
                  <p className="text-gray-500 dark:text-gray-400 mt-2 italic">
                    Note: {bookmark.note}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-2 text-blue-500 hover:text-blue-600"
                  onClick={() => onSelectBookmark(bookmark)}
                >
                  Go to
                </button>
                <button
                  className="p-2 text-red-500 hover:text-red-600"
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                >
                  Remove
                </button>
              </div>
            </div>
            <textarea
              className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              placeholder="Add a note..."
              value={bookmark.note || ""}
              onChange={(e) => handleUpdateNote(bookmark.id, e.target.value)}
            />
          </div>
        ))}
        {filteredBookmarks.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No bookmarks found
          </p>
        )}
      </div>
    </div>
  );
};

export default BookmarkPanel;
