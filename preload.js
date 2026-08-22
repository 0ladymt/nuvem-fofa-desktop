const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nuvemDesktop', {
  isDesktop:true,
  platform:process.platform,
  version:'0.3.10',
  checkForUpdates:()=>ipcRenderer.invoke('nuvem-update-check'),
  installUpdate:()=>ipcRenderer.invoke('nuvem-update-install'),
  getUpdateStatus:()=>ipcRenderer.invoke('nuvem-update-status'),
  getCaptureSources:()=>ipcRenderer.invoke('nuvem-capture-sources'),
  selectCaptureSource:(sourceId)=>ipcRenderer.invoke('nuvem-capture-select',sourceId),
  getCaptureState:()=>ipcRenderer.invoke('nuvem-capture-state'),
  copyText:(text)=>ipcRenderer.invoke('nuvem-copy-text',text),
  setFullscreen:(enabled)=>ipcRenderer.invoke('nuvem-window-fullscreen',!!enabled),
  setCaptureProtection:(enabled)=>ipcRenderer.invoke('nuvem-window-capture-protection',!!enabled),
  onUpdateEvent:(cb)=>{ipcRenderer.removeAllListeners('nuvem-update');ipcRenderer.on('nuvem-update',(_,data)=>cb(data));return ()=>ipcRenderer.removeAllListeners('nuvem-update')}
});

window.addEventListener('DOMContentLoaded', () => {
  for (const src of ['./v032-fixes.js','./v033-video-fixes.js','./v034-polish.js','./v035-runtime-fixes.js','./v037-discord-fixes.js','./v038-stream-fixes.js','./v039-stream-hotfix.js','./v0310-stream-focus.js']) {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  }
});
