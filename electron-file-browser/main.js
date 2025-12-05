const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { readdir, stat } = require('fs').promises;
const os = require('os');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, 'assets/icon.png') // Optional: add an icon
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// IPC handlers for file system operations
ipcMain.handle('get-drives', async () => {
  const platform = os.platform();
  let drives = [];
  
  if (platform === 'win32') {
    // On Windows, dynamically get all available drives
    const fs = require('fs');
    
    // Common Windows drive letters
    const driveLetters = ['A:', 'B:', 'C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:', 'N:', 'O:', 'P:', 'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'Y:', 'Z:'];
    
    for (const letter of driveLetters) {
      const drivePath = letter + '/';
      try {
        await stat(drivePath);
        drives.push(drivePath);
      } catch (error) {
        // Skip if drive doesn't exist or isn't accessible
        continue;
      }
    }
  } else {
    // On Unix-like systems, root is the main drive
    drives = ['/'];
  }
  
  return drives;
});

ipcMain.handle('get-directory-contents', async (event, path) => {
  try {
    const items = await readdir(path);
    const detailedItems = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.endsWith('/') ? `${path}${item}` : `${path}/${item}`;
        const stats = await stat(itemPath);
        return {
          name: item,
          path: itemPath,
          isDirectory: stats.isDirectory(),
        };
      })
    );
    return detailedItems;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});