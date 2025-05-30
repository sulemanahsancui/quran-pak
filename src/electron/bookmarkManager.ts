import { app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  timestamp: number;
  note?: string;
}

class BookmarkManager {
  private mainWindow: BrowserWindow;
  private bookmarks: Bookmark[] = [];
  private bookmarksPath: string;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.bookmarksPath = path.join(app.getPath("userData"), "bookmarks.json");
    this.loadBookmarks();
  }

  private loadBookmarks() {
    try {
      if (fs.existsSync(this.bookmarksPath)) {
        const data = fs.readFileSync(this.bookmarksPath, "utf-8");
        this.bookmarks = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      this.bookmarks = [];
    }
  }

  private saveBookmarks() {
    try {
      fs.writeFileSync(
        this.bookmarksPath,
        JSON.stringify(this.bookmarks, null, 2)
      );
    } catch (error) {
      console.error("Error saving bookmarks:", error);
    }
  }

  addBookmark(bookmark: Omit<Bookmark, "id" | "timestamp">) {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    this.bookmarks.unshift(newBookmark);
    this.saveBookmarks();
    this.mainWindow.webContents.send("bookmark-added", newBookmark);
    return newBookmark;
  }

  removeBookmark(id: string) {
    const index = this.bookmarks.findIndex((b) => b.id === id);
    if (index !== -1) {
      const removed = this.bookmarks.splice(index, 1)[0];
      this.saveBookmarks();
      this.mainWindow.webContents.send("bookmark-removed", id);
      return removed;
    }
    return null;
  }

  updateBookmarkNote(id: string, note: string) {
    const bookmark = this.bookmarks.find((b) => b.id === id);
    if (bookmark) {
      bookmark.note = note;
      this.saveBookmarks();
      this.mainWindow.webContents.send("bookmark-updated", bookmark);
      return bookmark;
    }
    return null;
  }

  getBookmarks() {
    return [...this.bookmarks];
  }

  getBookmarkById(id: string) {
    return this.bookmarks.find((b) => b.id === id);
  }

  getBookmarksBySurah(surahNumber: number) {
    return this.bookmarks.filter((b) => b.surahNumber === surahNumber);
  }

  clearAllBookmarks() {
    this.bookmarks = [];
    this.saveBookmarks();
    this.mainWindow.webContents.send("bookmarks-cleared");
  }
}

export default BookmarkManager;
