import "./App.css";
import React from "react";
import { QuranPage } from "./pages/QuranPage.tsx";
import { PrayerTimesPage } from "./pages/PrayerTimesPage.tsx";
import { IslamicCalendarPage } from "./pages/IslamicCalendarPage.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuranPage />} />
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route path="/islamic-calendar" element={<IslamicCalendarPage />} />
      </Routes>
    </Router>
  );
};
