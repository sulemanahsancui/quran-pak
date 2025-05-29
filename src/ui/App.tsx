import "./App.css";
import React from "react";
import { QuranPage } from "./pages/QuranPage.tsx";
import { PrayerTimesPage } from "./pages/PrayerTimesPage.tsx";
import { IslamicCalendarPage } from "./pages/IslamicCalendarPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quran" element={<QuranPage />} />
          <Route path="/prayer-times" element={<PrayerTimesPage />} />
          <Route path="/islamic-calendar" element={<IslamicCalendarPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};
