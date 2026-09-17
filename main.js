const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require("electron");
const path = require("path");

app.setName("Berenice");
app.setAppUserModelId("berenice.desktop.pet");

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

/** @type {BrowserWindow | null} */
let win = null;
/** @type {Tray | null} */
let tray = null;

function createWindow() {
  const area = screen.getPrimaryDisplay().workArea;
  win = new BrowserWindow({
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: false,
    show: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
  win.once("ready-to-show", () => win && win.showInactive());
  win.on("closed", () => {
    win = null;
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, "icon.png")).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip("Berenice — mascota de escritorio");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Hablar ahora", click: () => win?.webContents.send("talk") },
      { type: "separator" },
      {
        label: "Tamaño",
        submenu: [
          { label: "Pequeña", click: () => win?.webContents.send("size", 0.75) },
          { label: "Media", click: () => win?.webContents.send("size", 1) },
          { label: "Grande", click: () => win?.webContents.send("size", 1.3) },
        ],
      },
      { type: "separator" },
      {
        label: "Salir",
        click: () => {
          app.quit();
        },
      },
    ]),
  );
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.showInactive();
  }
});

app.on("window-all-closed", () => app.quit());

ipcMain.on("set-ignore", (_e, ignore) => {
  if (!win) return;
  if (ignore) win.setIgnoreMouseEvents(true, { forward: true });
  else win.setIgnoreMouseEvents(false);
});

ipcMain.on("quit", () => app.quit());
