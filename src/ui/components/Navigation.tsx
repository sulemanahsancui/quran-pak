import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle.tsx";

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background-light dark:bg-dark-background-light shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/assets/logo.svg"
                alt="Quran App Logo"
                className="h-8 w-8 mr-2"
              />
              <span className="text-xl font-bold text-primary dark:text-dark-primary">
                Quran App
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-primary dark:text-dark-primary bg-background dark:bg-dark-background"
                  : "text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary hover:bg-background dark:hover:bg-dark-background"
              }`}
            >
              Home
            </Link>
            <Link
              to="/quran"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/quran")
                  ? "text-primary dark:text-dark-primary bg-background dark:bg-dark-background"
                  : "text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary hover:bg-background dark:hover:bg-dark-background"
              }`}
            >
              Quran
            </Link>
            <Link
              to="/prayer-times"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/prayer-times")
                  ? "text-primary dark:text-dark-primary bg-background dark:bg-dark-background"
                  : "text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary hover:bg-background dark:hover:bg-dark-background"
              }`}
            >
              Prayer Times
            </Link>
            <Link
              to="/islamic-calendar"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/islamic-calendar")
                  ? "text-primary dark:text-dark-primary bg-background dark:bg-dark-background"
                  : "text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary hover:bg-background dark:hover:bg-dark-background"
              }`}
            >
              Islamic Calendar
            </Link>
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
