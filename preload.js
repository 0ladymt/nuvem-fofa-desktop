const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nuvemDesktop', {
  isDesktop:true,
  platform:process.platform,
  version:'4.0.0',
  checkForUpdates:()=>ipcRenderer.invoke('nuvem-update-check'),
  installUpdate:()=>ipcRenderer.invoke('nuvem-update-install'),
  getUpdateStatus:()=>ipcRenderer.invoke('nuvem-update-status'),
  getCaptureSources:()=>ipcRenderer.invoke('nuvem-capture-sources'),
  selectCaptureSource:(sourceId)=>ipcRenderer.invoke('nuvem-capture-select',sourceId),
  getCaptureState:()=>ipcRenderer.invoke('nuvem-capture-state'),
  copyText:(text)=>ipcRenderer.invoke('nuvem-copy-text',text),
  setFullscreen:(enabled)=>ipcRenderer.invoke('nuvem-window-fullscreen',!!enabled),
  minimizeWindow:()=>ipcRenderer.invoke('nuvem-window-minimize'),
  toggleMaximizeWindow:()=>ipcRenderer.invoke('nuvem-window-toggle-maximize'),
  closeWindow:()=>ipcRenderer.invoke('nuvem-window-close'),
  getWindowState:()=>ipcRenderer.invoke('nuvem-window-state'),
  setCaptureProtection:(enabled)=>ipcRenderer.invoke('nuvem-window-capture-protection',!!enabled),
  onWindowState:(cb)=>{ipcRenderer.removeAllListeners('nuvem-window-state');ipcRenderer.on('nuvem-window-state',(_,data)=>cb(data));return ()=>ipcRenderer.removeAllListeners('nuvem-window-state')},
  onUpdateEvent:(cb)=>{ipcRenderer.removeAllListeners('nuvem-update');ipcRenderer.on('nuvem-update',(_,data)=>cb(data));return ()=>ipcRenderer.removeAllListeners('nuvem-update')}
});

window.addEventListener('DOMContentLoaded', async () => {
  const sources = [
    './v032-fixes.js','./v033-video-fixes.js','./v034-polish.js','./v035-runtime-fixes.js','./v037-discord-fixes.js','./v038-stream-fixes.js','./v039-stream-hotfix.js','./v0310-stream-focus.js','./v0312-core-fixes.js','./v0313-desktop-polish.js','./v0315-stability-images.js','./v0316-server-images-share-ui.js','./v0317-share-picker-cleanup.js','./v0318-discord-stream-settings.js','./v0319-stream-controls-userbar-fix.js','./v0320-call-audio-context.js',
    './v400-core.js','./v400-ui.js','./v400-bridge.js'
  ];
  for (const src of sources) {
    await new Promise(resolve=>{
      const script=document.createElement('script');script.src=src;script.async=false;script.onload=resolve;script.onerror=()=>{console.error('[Nuvem Fofa] Falha ao carregar módulo:',src);resolve()};document.body.appendChild(script)
    });
  }
});
