const { contextBridge } = require("electron");

// Acá más adelante se expone la comunicación real con el backend
// (por ejemplo vía IPC o fetch a la API REST). Por ahora queda vacío
// a propósito: el frontend consume mockData.js directamente.
contextBridge.exposeInMainWorld("api", {
  // ejemplo futuro: getSocios: () => ipcRenderer.invoke("socios:get"),
});
