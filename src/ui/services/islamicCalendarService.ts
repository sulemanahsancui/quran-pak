interface IslamicDate {
  date: string;
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

export const islamicCalendarService = {
  async getCurrentIslamicDate(): Promise<IslamicDate> {
    const today = new Date();
    const formattedDate = `${today.getDate()}-${
      today.getMonth() + 1
    }-${today.getFullYear()}`;

    const response = await fetch(
      `https://api.aladhan.com/v1/gToH/${formattedDate}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Islamic date");
    }

    const data = await response.json();
    if (data.code === 200 && data.data && data.data.hijri) {
      return data.data.hijri;
    }
    throw new Error("Invalid Islamic date data");
  },

  getImportantDates() {
    return [
      { month: 1, day: 1, name: "Islamic New Year" },
      { month: 1, day: 10, name: "Day of Ashura" },
      { month: 3, day: 12, name: "Mawlid al-Nabi" },
      { month: 7, day: 27, name: "Laylat al-Qadr" },
      { month: 9, day: 1, name: "First day of Ramadan" },
      { month: 10, day: 1, name: "Eid al-Fitr" },
      { month: 12, day: 10, name: "Eid al-Adha" },
    ];
  },
};
