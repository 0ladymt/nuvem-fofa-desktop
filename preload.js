const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nuvemDesktop', {
  isDesktop:true,
  platform:process.platform,
  version:'0.3.0',
  checkForUpdates:()=>ipcRenderer.invoke('nuvem-update-check'),
  installUpdate:()=>ipcRenderer.invoke('nuvem-update-install'),
  getUpdateStatus:()=>ipcRenderer.invoke('nuvem-update-status'),
  onUpdateEvent:(cb)=>{ipcRenderer.removeAllListeners('nuvem-update');ipcRenderer.on('nuvem-update',(_,data)=>cb(data));return ()=>ipcRenderer.removeAllListeners('nuvem-update')}
});
