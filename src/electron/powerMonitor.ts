import { powerMonitor, BrowserWindow } from "electron";

class PowerMonitorManager {
  private mainWindow: BrowserWindow | null = null;
  private lastActiveTime: number = Date.now();

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupPowerMonitor();
  }

  private setupPowerMonitor() {
    // Handle system suspend
    powerMonitor.on("suspend", () => {
      this.lastActiveTime = Date.now();
      this.mainWindow?.webContents.send("system-suspend");
    });

    // Handle system resume
    powerMonitor.on("resume", () => {
      const timeDiff = Date.now() - this.lastActiveTime;
      this.mainWindow?.webContents.send("system-resume", { timeDiff });
    });

    // Handle system lock
    powerMonitor.on("lock-screen", () => {
      this.mainWindow?.webContents.send("system-lock");
    });

    // Handle system unlock
    powerMonitor.on("unlock-screen", () => {
      this.mainWindow?.webContents.send("system-unlock");
    });

    // Handle AC power status
    powerMonitor.on("on-ac", () => {
      this.mainWindow?.webContents.send("power-status", { type: "ac" });
    });

    powerMonitor.on("on-battery", () => {
      this.mainWindow?.webContents.send("power-status", { type: "battery" });
    });
  }

  public getSystemIdleTime(): number {
    return powerMonitor.getSystemIdleTime();
  }

  public isOnBatteryPower(): boolean {
    return powerMonitor.isOnBatteryPower();
  }

  public destroy() {
    // Remove all listeners
    powerMonitor.removeAllListeners("suspend");
    powerMonitor.removeAllListeners("resume");
    powerMonitor.removeAllListeners("lock-screen");
    powerMonitor.removeAllListeners("unlock-screen");
    powerMonitor.removeAllListeners("on-ac");
    powerMonitor.removeAllListeners("on-battery");
  }
}

export default PowerMonitorManager;
