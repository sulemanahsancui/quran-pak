import { Notification, BrowserWindow } from "electron";

interface NotificationOptions {
  title: string;
  body: string;
  urgency?: "normal" | "low" | "critical";
  silent?: boolean;
  icon?: string;
  timeoutType?: "default" | "never";
}

class NotificationManager {
  private static instance: NotificationManager;
  private isEnabled: boolean = true;
  private mainWindow: BrowserWindow;

  private constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  static getInstance(mainWindow: BrowserWindow): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager(mainWindow);
    }
    return NotificationManager.instance;
  }

  showNotification(options: NotificationOptions) {
    if (!this.isEnabled) return;

    const notification = new Notification({
      title: options.title,
      body: options.body,
      urgency: options.urgency ?? "normal",
      silent: options.silent ?? false,
      icon: options.icon,
      timeoutType: options.timeoutType ?? "default",
    });

    notification.show();
  }

  showPrayerTimeNotification(prayerName: string, time: string) {
    return this.showNotification({
      title: "Prayer Time",
      body: `It's time for ${prayerName} prayer (${time})`,
      urgency: "critical",
      timeoutType: "never",
    });
  }

  showBookmarkNotification(surahName: string, ayahNumber: number) {
    return this.showNotification({
      title: "Bookmark Added",
      body: `Bookmarked ${surahName} - Ayah ${ayahNumber}`,
      urgency: "low",
    });
  }

  showErrorNotification(message: string) {
    return this.showNotification({
      title: "Error",
      body: message,
      urgency: "critical",
    });
  }

  showSuccessNotification(message: string) {
    return this.showNotification({
      title: "Success",
      body: message,
      urgency: "normal",
    });
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

export default NotificationManager;
