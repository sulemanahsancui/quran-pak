import { IslamicDate } from "../types/quran.ts";
import React, { useState, useEffect } from "react";
import { Navigation } from "../components/navigation.tsx";
import { islamicCalendarService } from "../services/islamicCalendarService.ts";

export const IslamicCalendarPage: React.FC = () => {
  const [islamicDate, setIslamicDate] = useState<IslamicDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const date = await islamicCalendarService.getCurrentIslamicDate();
        setIslamicDate(date);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const importantDates = islamicCalendarService.getImportantDates();

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        <div className="bg-background-light dark:bg-dark-background-light rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-text dark:text-dark-text mb-6">
            Islamic Calendar
          </h1>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-dark-primary"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {islamicDate && (
            <div className="space-y-6">
              <div className="bg-background dark:bg-dark-background rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-text dark:text-dark-text mb-2">
                  {islamicDate.day} {islamicDate.month.en} {islamicDate.year}
                </h2>
                <p className="text-text-dark dark:text-dark-text-dark">
                  {islamicDate.month.ar} {islamicDate.year}{" "}
                  {islamicDate.designation.expanded}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
                  Important Islamic Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {importantDates.map((date) => (
                    <div
                      key={`${date.month}-${date.day}`}
                      className="bg-background dark:bg-dark-background rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <h4 className="font-semibold text-text dark:text-dark-text mb-1">
                        {date.name}
                      </h4>
                      <p className="text-text-dark dark:text-dark-text-dark">
                        {date.day} {islamicDate.month.en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
