import React from "react";
import { Link, useLocation } from "react-router-dom";

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/assets/logo.svg"
                alt="Quran App Logo"
                className="h-8 w-8 mr-2"
              />
              <span className="text-xl font-bold text-green-600">
                Quran App
              </span>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-green-600 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              Home
            </Link>
            <Link
              to="/quran"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/quran")
                  ? "text-green-600 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              Quran
            </Link>
            <Link
              to="/prayer-times"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/prayer-times")
                  ? "text-green-600 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              Prayer Times
            </Link>
            <Link
              to="/islamic-calendar"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/islamic-calendar")
                  ? "text-green-600 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              Islamic Calendar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
