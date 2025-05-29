import { PrayerTimes } from "../types/quran.ts";
import React, { useState, useEffect } from "react";
import { Navigation } from "../components/Navigation.tsx";
import { prayerService } from "../services/prayerService.ts";

export const PrayerTimesPage: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState({
    city: "",
    country: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const locationData: any = await prayerService.getCurrentLocation();
      setLocation(locationData);

      const prayerTimesData = await prayerService.getPrayerTimes(
        locationData.latitude,
        locationData.longitude
      );
      setPrayerTimes(prayerTimesData);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use a default location (e.g., Mecca) if manual location is not provided
      const defaultLocation = {
        latitude: 21.4225,
        longitude: 39.8262,
        city: manualLocation.city || "Mecca",
        country: manualLocation.country || "Saudi Arabia",
      };

      setLocation(defaultLocation);
      const prayerTimesData = await prayerService.getPrayerTimes(
        defaultLocation.latitude,
        defaultLocation.longitude
      );
      setPrayerTimes(prayerTimesData);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Prayer Times</h1>
            <button
              onClick={fetchData}
              disabled={loading}
              className={`px-4 py-2 bg-green-500 text-white rounded-lg transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
              }`}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                {error}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Manual Location
                </h3>
                <form
                  onSubmit={handleManualLocationSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={manualLocation.city}
                      onChange={(e) =>
                        setManualLocation({
                          ...manualLocation,
                          city: e.target.value,
                        })
                      }
                      className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Enter city name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      value={manualLocation.country}
                      onChange={(e) =>
                        setManualLocation({
                          ...manualLocation,
                          country: e.target.value,
                        })
                      }
                      className="mt-1 block p-3 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Enter country name"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-4 py-2 bg-green-500 text-white rounded-lg transition-colors ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-green-600"
                    }`}
                  >
                    {loading ? "Loading..." : "Get Prayer Times"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {location && prayerTimes && !loading && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Location
                </h2>
                <p className="text-gray-600">
                  {location?.city}, {location?.country}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(prayerTimes).map(([prayer, time]) => (
                  <div
                    key={prayer}
                    className="bg-gray-50 rounded-lg p-4 text-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {prayer}
                    </h3>
                    <p className="text-gray-600">{time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
