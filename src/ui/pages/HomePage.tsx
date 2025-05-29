import React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to Quran App
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            to="/quran"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              Quran
            </h2>
            <p className="text-gray-600">
              Read and listen to the Holy Quran with translations and audio
              recitations.
            </p>
          </Link>
          <Link
            to="/prayer-times"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              Prayer Times
            </h2>
            <p className="text-gray-600">
              Get accurate prayer times for your location and track your
              prayers.
            </p>
          </Link>
          <Link
            to="/islamic-calendar"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              Islamic Calendar
            </h2>
            <p className="text-gray-600">
              View the Islamic calendar and important dates in the Hijri year.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
