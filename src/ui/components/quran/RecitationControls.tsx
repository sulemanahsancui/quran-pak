import React, { useEffect, useState } from "react";
import { Reciter, RecitationSettings } from "../../types/electron";

const RecitationControls: React.FC = () => {
  const [settings, setSettings] = useState<RecitationSettings | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadSettings();
    loadReciters();

    const unsubscribe = window.electron?.recitation?.onSettingsUpdated(
      (newSettings: RecitationSettings) => {
        setSettings(newSettings);
        setIsPlaying(newSettings.isPlaying || false);
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await window.electron?.recitation?.getSettings();
      setSettings(settings || null);
      setIsPlaying(settings?.isPlaying || false);
    } catch (err) {
      console.error("Error loading recitation settings:", err);
      setError("Failed to load recitation settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadReciters = async () => {
    try {
      const reciters = await window.electron?.recitation?.getReciters();
      setReciters(reciters || []);
    } catch (err) {
      console.error("Error loading reciters:", err);
      setError("Failed to load reciters. Please try again.");
    }
  };

  const handleSettingsChange = async (updates: Partial<RecitationSettings>) => {
    try {
      await window.electron?.recitation?.updateSettings(updates);
    } catch (err) {
      console.error("Error updating settings:", err);
      setError("Failed to update settings. Please try again.");
    }
  };

  const handlePlay = async () => {
    if (!settings) return;
    try {
      if (isPlaying) {
        await window.electron?.recitation?.pause();
        setIsPlaying(false);
      } else {
        await window.electron?.recitation?.resume();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Error controlling playback:", err);
      setError("Failed to control playback. Please try again.");
    }
  };

  const handleStop = async () => {
    try {
      await window.electron?.recitation?.stop();
      setIsPlaying(false);
    } catch (err) {
      console.error("Error stopping playback:", err);
      setError("Failed to stop playback. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={loadSettings}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Recitation Settings
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reciter
          </label>
          <select
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={settings.currentReciter}
            onChange={(e) =>
              handleSettingsChange({ currentReciter: e.target.value })
            }
          >
            {reciters.map((reciter) => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name} ({reciter.language})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Volume
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume}
            onChange={(e) =>
              handleSettingsChange({ volume: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Speed
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.playbackSpeed}
            onChange={(e) =>
              handleSettingsChange({ playbackSpeed: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Repeat Count
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={settings.repeatCount}
            onChange={(e) =>
              handleSettingsChange({ repeatCount: Number(e.target.value) })
            }
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoPlay"
            checked={settings.autoPlay}
            onChange={(e) =>
              handleSettingsChange({ autoPlay: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="autoPlay"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Auto Play
          </label>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => window.electron.recitation.playAyah(1, 1)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Play Ayah 1:1
          </button>
          <button
            onClick={() => window.electron.recitation.playSurah(1)}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            Play Surah 1
          </button>
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecitationControls;
