const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nuvemDesktop', {
  isDesktop:true,
  platform:process.platform,
  version:'0.3.2',
  checkForUpdates:()=>ipcRenderer.invoke('nuvem-update-check'),
  installUpdate:()=>ipcRenderer.invoke('nuvem-update-install'),
  getUpdateStatus:()=>ipcRenderer.invoke('nuvem-update-status'),
  getCaptureSources:()=>ipcRenderer.invoke('nuvem-capture-sources'),
  selectCaptureSource:(sourceId)=>ipcRenderer.invoke('nuvem-capture-select',sourceId),
  copyText:(text)=>ipcRenderer.invoke('nuvem-copy-text',text),
  onUpdateEvent:(cb)=>{ipcRenderer.removeAllListeners('nuvem-update');ipcRenderer.on('nuvem-update',(_,data)=>cb(data));return ()=>ipcRenderer.removeAllListeners('nuvem-update')}
});

// Carrega o patch incremental depois que a interface principal terminou de montar.
window.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = './v032-fixes.js';
  script.defer = true;
  document.body.appendChild(script);
});
