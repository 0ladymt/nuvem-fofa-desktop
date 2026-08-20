const { app, BrowserWindow, session, desktopCapturer, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

app.setAppUserModelId('com.nuvemfofa.desktop');

let mainWindow;
let updaterConfigured = false;

function sendUpdate(payload){
  if(mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('nuvem-update', payload);
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
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}
  });
  mainWindow.loadFile(path.join(__dirname,'app','index.html'));
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
        // Keep Chromium's system picker when available. This callback only supplies a fallback.
        callback({video:sources[0],audio:'loopback'});
      }catch(e){callback({});}
    },{useSystemPicker:true});
  }
  ipcMain.handle('nuvem-update-check',async()=>{if(!app.isPackaged)return {ok:false,dev:true};try{await autoUpdater.checkForUpdates();return {ok:true}}catch(e){return {ok:false,error:e.message}}});
  ipcMain.handle('nuvem-update-install',()=>{if(!app.isPackaged)return false;autoUpdater.quitAndInstall(true,true);return true});
  ipcMain.handle('nuvem-update-status',()=>({version:app.getVersion(),packaged:app.isPackaged}));
  createWindow();
  configureUpdater();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
