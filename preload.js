const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  setIgnore: (ignore) => ipcRenderer.send("set-ignore", ignore),
  quit: () => ipcRenderer.send("quit"),
  onTalk: (fn) => ipcRenderer.on("talk", fn),
  onSize: (fn) => ipcRenderer.on("size", (_e, n) => fn(n)),
});
