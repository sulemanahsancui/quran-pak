interface ElectronAPI {
  tray: {
    onGoToPosition: (callback: (position: { page: number }) => void) => void;
    onNavigatePage: (callback: (delta: number) => void) => void;
    onOpenSettings: (callback: () => void) => void;
    updateLastPosition: (page: number) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
