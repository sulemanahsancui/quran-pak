import React from "react";
import { useNavigate } from "react-router-dom";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Quran",
      description: "Read and listen to the Holy Quran with translations",
      icon: "📖",
      path: "/quran",
      color: "bg-green-500",
    },
    {
      title: "Prayer Times",
      description: "Get accurate prayer times for your location",
      icon: "🕌",
      path: "/prayer-times",
      color: "bg-blue-500",
    },
    {
      title: "Islamic Calendar",
      description: "View Islamic dates and important events",
      icon: "📅",
      path: "/islamic-calendar",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text dark:text-dark-text mb-4">
            Welcome to Islamic App
          </h1>
          <p className="text-xl text-text-dark dark:text-dark-text-dark">
            Your comprehensive Islamic companion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-background-light dark:bg-dark-background-light rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => navigate(feature.path)}
            >
              <div className={`${feature.color} p-6`}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {feature.title}
                </h2>
                <p className="text-white opacity-90">{feature.description}</p>
              </div>
              <div className="p-6">
                <button
                  className={`w-full py-2 px-4 rounded-lg text-white ${feature.color} hover:opacity-90 transition-opacity`}
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-8 text-center">
            Features Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Qibla Direction",
                description: "Find the direction of Qibla from your location",
                icon: "🧭",
                color: "bg-yellow-500",
              },
              {
                title: "Islamic Duas",
                description:
                  "Collection of authentic duas from Quran and Hadith",
                icon: "🤲",
                color: "bg-red-500",
              },
              {
                title: "Islamic Stories",
                description:
                  "Learn from the stories of prophets and companions",
                icon: "📚",
                color: "bg-indigo-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-background-light dark:bg-dark-background-light rounded-xl shadow-lg overflow-hidden"
              >
                <div className={`${feature.color} p-6`}>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-white opacity-90">{feature.description}</p>
                </div>
                <div className="p-6">
                  <button
                    className={`w-full py-2 px-4 rounded-lg text-white ${feature.color} opacity-50 cursor-not-allowed`}
                    disabled
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
