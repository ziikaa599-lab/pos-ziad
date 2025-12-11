const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow = null;
let nextServer = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = 3000;

function createWindow() {
  // Create a simple, borderless window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: false, // Borderless window as requested
    titleBarStyle: 'hidden',
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    icon: join(__dirname, '../public/logo.png'),
    show: false, // Don't show until ready
  });

  // Load the Next.js app
  const url = isDev 
    ? `http://localhost:${PORT}` 
    : `http://localhost:${PORT}`;

  mainWindow.loadURL(url);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      
      // Open DevTools in development
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window closed
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      // In development, Next.js dev server should already be running
      // Wait for it to be ready
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds max wait
      const checkServer = setInterval(() => {
        attempts++;
        const req = http.get(`http://localhost:${PORT}`, (res) => {
          if (res.statusCode === 200 || res.statusCode === 404) {
            clearInterval(checkServer);
            resolve();
          }
        });
        req.on('error', () => {
          // Server not ready yet, continue waiting
          if (attempts >= maxAttempts) {
            clearInterval(checkServer);
            reject(new Error('Next.js dev server did not start in time'));
          }
        });
        req.setTimeout(1000, () => {
          req.destroy();
        });
      }, 500);
      return;
    }

    // In production, start the Next.js server
    // In packaged app, resources are in different locations
    let appPath = app.getAppPath();
    if (app.isPackaged) {
      // When packaged, the app is in resources/app
      appPath = process.resourcesPath ? join(process.resourcesPath, 'app') : appPath;
    }
    const nextPath = join(appPath, '.next', 'standalone');
    const serverPath = join(nextPath, 'server.js');
    
    // Check if standalone build exists
    if (!fs.existsSync(serverPath)) {
      console.error('Standalone server not found. Please run "npm run build" first.');
      reject(new Error('Standalone server not found'));
      return;
    }

    // Start the Next.js server
    nextServer = spawn('node', [serverPath], {
      cwd: nextPath,
      env: {
        ...process.env,
        PORT: PORT.toString(),
        NODE_ENV: 'production',
      },
      stdio: 'inherit',
    });

    nextServer.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      reject(error);
    });

    // Wait for server to be ready
    let attempts = 0;
    const maxAttempts = 60;
    const checkServer = setInterval(() => {
      attempts++;
      const req = http.get(`http://localhost:${PORT}`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          clearInterval(checkServer);
          resolve();
        }
      });
      req.on('error', () => {
        // Server not ready yet, continue waiting
        if (attempts >= maxAttempts) {
          clearInterval(checkServer);
          reject(new Error('Next.js server did not start in time'));
        }
      });
      req.setTimeout(1000, () => {
        req.destroy();
      });
    }, 500);
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  try {
    await startNextServer();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});

