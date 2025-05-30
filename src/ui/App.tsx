import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { IslamicCalendarPage } from "./pages/IslamicCalendarPage.tsx";
import { PrayerTimesPage } from "./pages/PrayerTimesPage.tsx";
import { QuranPage } from "./pages/QuranPage.tsx";

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-background dark:bg-dark-background text-text dark:text-dark-text transition-colors duration-200">
          <Router>
            {/* <Navigation /> */}
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/quran" element={<QuranPage />} />
                <Route path="/prayer-times" element={<PrayerTimesPage />} />
                <Route
                  path="/islamic-calendar"
                  element={<IslamicCalendarPage />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </Router>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
