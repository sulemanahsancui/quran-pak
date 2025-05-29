import { ipcMain, WebContents, WebFrameMain } from 'electron';
import { getUIPath } from './pathResolver.js';
import { pathToFileURL } from 'url';

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function ipcMainHandle(
  key: any,
  handler: () => any
) {
  ipcMain.handle(key, (event:any) => {
    validateEventFrame(event.senderFrame);
    return handler();
  });
}

export function ipcMainOn(
  key: any,
  handler: (payload: any) => void
) {
  ipcMain.on(key, (event:any, payload) => {
    validateEventFrame(event.senderFrame);
    return handler(payload);
  });
}

export function ipcWebContentsSend(
  key: any,
  webContents: WebContents,
  payload: any
) {
  webContents.send(key, payload);
}

export function validateEventFrame(frame: WebFrameMain) {
  if (isDev() && new URL(frame.url).host === 'localhost:5123') {
    return;
  }
  if (frame.url !== pathToFileURL(getUIPath()).toString()) {
    throw new Error('Malicious event');
  }
}