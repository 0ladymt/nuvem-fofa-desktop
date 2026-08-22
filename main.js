const { app, BrowserWindow, session, desktopCapturer, ipcMain, clipboard } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

app.setAppUserModelId('com.nuvemfofa.desktop');

let mainWindow;
let updaterConfigured = false;
let pendingCaptureSourceId = null;
let activeCaptureSource = null;

function sendUpdate(payload){
  if(mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('nuvem-update', payload);
}

function sendWindowState(){
  if(!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('nuvem-window-state', {
    maximized: mainWindow.isMaximized(),
    fullscreen: mainWindow.isFullScreen()
  });
}

function configureUpdater(){
  if(!app.isPackaged || updaterConfigured) return;
  updaterConfigured = true;
  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.on('checking-for-update',()=>sendUpdate({type:'checking'}));
  autoUpdater.on('update-available',info=>sendUpdate({type:'available',version:info.version}));
  autoUpdater.on('update-not-available',()=>sendUpdate({type:'none',version:app.getVersion()}));
  autoUpdater.on('download-progress',p=>sendUpdate({type:'progress',percent:p.percent,bytesPerSecond:p.bytesPerSecond,transferred:p.transferred,total:p.total}));
  autoUpdater.on('update-downloaded',info=>sendUpdate({type:'downloaded',version:info.version}));
  autoUpdater.on('error',err=>{log.error(err);sendUpdate({type:'error',message:'Não foi possível atualizar agora.'})});
  setTimeout(()=>autoUpdater.checkForUpdates().catch(()=>{}),6000);
}

function createWindow(){
  mainWindow = new BrowserWindow({
    width:1440,height:900,minWidth:980,minHeight:650,
    backgroundColor:'#111214',title:'Nuvem Fofa',icon:path.join(__dirname,'assets','nuvem-fofa.ico'),autoHideMenuBar:true,
    frame:false,
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}
  });
  mainWindow.loadFile(path.join(__dirname,'app','index.html'));
  mainWindow.on('maximize',sendWindowState);
  mainWindow.on('unmaximize',sendWindowState);
  mainWindow.on('enter-full-screen',sendWindowState);
  mainWindow.on('leave-full-screen',sendWindowState);
  mainWindow.webContents.on('did-finish-load',sendWindowState);
  mainWindow.on('closed',()=>{mainWindow=null});
}

app.whenReady().then(async()=>{
  session.defaultSession.setPermissionRequestHandler((webContents,permission,callback)=>{
    const allowed=new Set(['media','fullscreen','notifications']); callback(allowed.has(permission));
  });
  if(session.defaultSession.setDisplayMediaRequestHandler){
    session.defaultSession.setDisplayMediaRequestHandler(async(request,callback)=>{
      try{
        const sources=await desktopCapturer.getSources({types:['screen','window'],thumbnailSize:{width:640,height:360},fetchWindowIcons:true});
        const chosen=sources.find(s=>s.id===pendingCaptureSourceId)||sources[0];
        activeCaptureSource=chosen?{id:chosen.id,name:chosen.name,type:String(chosen.id||'').startsWith('screen:')?'screen':'window'}:null;
        pendingCaptureSourceId=null;
        callback(chosen?{video:chosen,audio:'loopback'}:{});
      }catch(e){pendingCaptureSourceId=null;activeCaptureSource=null;callback({});}
    });
  }
  ipcMain.handle('nuvem-capture-sources',async()=>{
    const [screens,windows]=await Promise.all([
      desktopCapturer.getSources({types:['screen'],thumbnailSize:{width:640,height:360},fetchWindowIcons:true}),
      desktopCapturer.getSources({types:['window'],thumbnailSize:{width:640,height:360},fetchWindowIcons:true})
    ]);
    const pack=(s,type)=>({id:s.id,name:s.name,type,thumbnail:s.thumbnail?.toDataURL?.()||'',icon:s.appIcon?.toDataURL?.()||''});
    return [...screens.map(s=>pack(s,'screen')),...windows.map(s=>pack(s,'window'))];
  });
  ipcMain.handle('nuvem-capture-select',(_,sourceId)=>{pendingCaptureSourceId=String(sourceId||'');return true});
  ipcMain.handle('nuvem-capture-state',()=>activeCaptureSource||{});
  ipcMain.handle('nuvem-copy-text',(_,text)=>{clipboard.writeText(String(text||''));return true});
  ipcMain.handle('nuvem-window-fullscreen',(_,enabled)=>{if(!mainWindow||mainWindow.isDestroyed())return false;mainWindow.setFullScreen(!!enabled);sendWindowState();return mainWindow.isFullScreen()});
  ipcMain.handle('nuvem-window-minimize',()=>{if(!mainWindow||mainWindow.isDestroyed())return false;mainWindow.minimize();return true});
  ipcMain.handle('nuvem-window-toggle-maximize',()=>{if(!mainWindow||mainWindow.isDestroyed())return false;if(mainWindow.isMaximized())mainWindow.unmaximize();else mainWindow.maximize();sendWindowState();return mainWindow.isMaximized()});
  ipcMain.handle('nuvem-window-close',()=>{if(!mainWindow||mainWindow.isDestroyed())return false;mainWindow.close();return true});
  ipcMain.handle('nuvem-window-state',()=>({maximized:!!mainWindow?.isMaximized(),fullscreen:!!mainWindow?.isFullScreen()}));
  ipcMain.handle('nuvem-window-capture-protection',(_,enabled)=>{if(!mainWindow||mainWindow.isDestroyed())return false;try{mainWindow.setContentProtection(!!enabled);return true}catch{return false}});
  ipcMain.handle('nuvem-update-check',async()=>{if(!app.isPackaged)return {ok:false,dev:true};try{await autoUpdater.checkForUpdates();return {ok:true}}catch(e){return {ok:false,error:e.message}}});
  ipcMain.handle('nuvem-update-install',()=>{if(!app.isPackaged)return false;autoUpdater.quitAndInstall(true,true);return true});
  ipcMain.handle('nuvem-update-status',()=>({version:app.getVersion(),packaged:app.isPackaged}));
  createWindow();
  configureUpdater();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
