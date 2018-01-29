import {
  app,
  BrowserWindow,
  ipcMain,
} from 'electron';
import {
  main,
  validateXLSx,
  getXLSxData,
  generateTranslations,
  render,
} from './translationEngine';
import fs from 'fs';

// remove this when we go to prod
const path = require('path');
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
});
// also npm uninstall electron-reload --save

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const ipc = ipcMain;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on('init-render', (event, arg) => {
  const dir = fs.readdirSync(arg);
  dir.map((e) => {
    if (e !== '.DS_Store') {
      const fPath = `${arg}/${e}`;
      const r = getXLSxData(fPath);

      if (r) {
        event.sender.send('file-read-ok', e, r);
      } else {
        event.sender.send('file-read-bad', e);
      }
    }
  });
});

ipcMain.on('project-bootstrap', (event, arg) => {
  const folderName = `${arg}/templates`;
  fs.mkdirSync(folderName);
  fs.mkdirSync(`${folderName}/my-page-template`);
  fs.mkdirSync(`${folderName}/my-page-template/translations`);
  event.sender.send('project-created', event, folderName);
});
