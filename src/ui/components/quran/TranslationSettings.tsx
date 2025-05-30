import React, { useEffect, useState } from "react";
import { Translation, TranslationSettings } from "../../types/electron";

const TranslationSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<TranslationSettings | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadTranslations();

    const unsubscribe = window.electron?.translation?.onSettingsUpdated(
      (newSettings: TranslationSettings) => {
        setSettings(newSettings);
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
      const settings = await window.electron?.translation?.getSettings();
      setSettings(settings || null);
    } catch (err) {
      console.error("Error loading translation settings:", err);
      setError("Failed to load translation settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadTranslations = async () => {
    try {
      const translations =
        await window.electron?.translation?.getTranslations();
      setTranslations(translations || []);
    } catch (err) {
      console.error("Error loading translations:", err);
      setError("Failed to load translations. Please try again.");
    }
  };

  const handleSettingsChange = async (
    updates: Partial<TranslationSettings>
  ) => {
    try {
      await window.electron?.translation?.updateSettings(updates);
    } catch (err) {
      console.error("Error updating settings:", err);
      setError("Failed to update settings. Please try again.");
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
        Translation Settings
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Primary Translation
          </label>
          <select
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={settings.primaryTranslation}
            onChange={(e) =>
              handleSettingsChange({ primaryTranslation: e.target.value })
            }
          >
            {translations.map((translation) => (
              <option key={translation.id} value={translation.id}>
                {translation.name} ({translation.language})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Secondary Translation
          </label>
          <select
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={settings.secondaryTranslation || ""}
            onChange={(e) =>
              handleSettingsChange({
                secondaryTranslation: e.target.value || null,
              })
            }
          >
            <option value="">None</option>
            {translations.map((translation) => (
              <option key={translation.id} value={translation.id}>
                {translation.name} ({translation.language})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showArabic"
            checked={settings.showArabic}
            onChange={(e) =>
              handleSettingsChange({ showArabic: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="showArabic"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Show Arabic Text
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showTransliteration"
            checked={settings.showTransliteration}
            onChange={(e) =>
              handleSettingsChange({ showTransliteration: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="showTransliteration"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Show Transliteration
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Font Size ({settings.fontSize}px)
          </label>
          <input
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={(e) =>
              handleSettingsChange({ fontSize: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Line Spacing ({settings.lineSpacing.toFixed(1)})
          </label>
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={settings.lineSpacing}
            onChange={(e) =>
              handleSettingsChange({ lineSpacing: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default TranslationSettingsPanel;
