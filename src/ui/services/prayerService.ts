interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface Location {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const prayerService = {
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            console.log({ latitude, longitude });
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (!response.ok) {
              throw new Error("Failed to fetch location details");
            }

            const data = await response.json();
            resolve({
              city:
                data.address.city ||
                data.address.town ||
                data.address.village ||
                "Unknown City",
              country: data.address.country || "Unknown Country",
              latitude,
              longitude,
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(
                new Error(
                  "Please enable location access in your browser settings"
                )
              );
              break;
            case error.POSITION_UNAVAILABLE:
              reject(
                new Error(
                  "Location information is unavailable. Please check your system location settings."
                )
              );
              break;
            case error.TIMEOUT:
              reject(
                new Error(
                  "Location request timed out. Please check your internet connection and try again."
                )
              );
              break;
            default:
              reject(
                new Error(
                  "An unknown error occurred while getting your location"
                )
              );
              break;
          }
        },
        options
      );
    });
  },

  async getPrayerTimes(
    latitude: number,
    longitude: number
  ): Promise<PrayerTimes> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=2`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prayer times");
      }

      const data = await response.json();
      if (data.code === 200 && data.data && data.data.timings) {
        return data.data.timings;
      }
      throw new Error("Invalid prayer times data");
    } catch (error) {
      throw new Error(
        "Failed to fetch prayer times. Please check your internet connection and try again."
      );
    }
  },
};
