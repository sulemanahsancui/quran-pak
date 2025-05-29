import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./ui/components/Navigation";
import { QuranPage } from "./ui/pages/QuranPage";
import { PrayerTimesPage } from "./ui/pages/PrayerTimesPage";
import { IslamicCalendarPage } from "./ui/pages/IslamicCalendarPage";
import { HomePage } from "./ui/pages/HomePage";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quran" element={<QuranPage />} />
            <Route path="/prayer-times" element={<PrayerTimesPage />} />
            <Route path="/islamic-calendar" element={<IslamicCalendarPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
