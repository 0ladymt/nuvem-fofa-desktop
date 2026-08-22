// Nuvem Fofa v0.3.2 — estabilização da interface e convites
(() => {
  const $ = id => document.getElementById(id);
  let pendingServerIconV032 = null;

  const style = document.createElement('style');
  style.textContent = `
    .voice-panel-user{display:none!important}
    .nf-stream-focus{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:99999!important;border-radius:0!important;background:#000!important;margin:0!important;max-width:none!important;max-height:none!important}
    .nf-stream-focus video{width:100%!important;height:100%!important;object-fit:contain!important;background:#000!important}
    .nf-stream-focus .fullscreen-btn{position:absolute!important;top:14px!important;right:14px!important;z-index:100001!important}
    .nf-invite-link{color:#00a8fc;text-decoration:none;cursor:pointer;word-break:break-all}
    .nf-invite-link:hover{text-decoration:underline}
    #mediaViewerBody img,.media-viewer-body img{filter:none!important;mix-blend-mode:normal!important;opacity:1!important}
  `;
  document.head.appendChild(style);

  // Remove o perfil duplicado que a v0.3.1 adicionava dentro do painel de voz.
  function cleanupDuplicateVoiceProfile(){
    document.querySelectorAll('#voicePanel .voice-panel-user').forEach(el=>el.remove());
  }
  const voiceObs = new MutationObserver(cleanupDuplicateVoiceProfile);
  voiceObs.observe(document.documentElement,{subtree:true,childList:true});
  cleanupDuplicateVoiceProfile();

  // Fullscreen confiável no Electron: usa modo de foco que ocupa toda a janela.
  window.fullscreenTile = async function(id){
    const el=$(id); if(!el) return;
    const active=el.classList.contains('nf-stream-focus');
    document.querySelectorAll('.nf-stream-focus').forEach(x=>x.classList.remove('nf-stream-focus'));
    if(active) return;
    el.classList.add('nf-stream-focus');
    try{ await el.requestFullscreen?.(); }catch{}
  };
  document.addEventListener('fullscreenchange',()=>{
    if(!document.fullscreenElement) document.querySelectorAll('.nf-stream-focus').forEach(x=>x.classList.remove('nf-stream-focus'));
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') document.querySelectorAll('.nf-stream-focus').forEach(x=>x.classList.remove('nf-stream-focus'));
  });

  // Preserva melhor as cores e a nitidez de avatar ao recortar; também corrige serverIcon.
  const originalApplyCrop = window.applyCrop;
  window.applyCrop = function(){
    if(!window.cropState || !['avatar','serverIcon'].includes(cropState.type)) return originalApplyCrop?.();
    const {img,type}=cropState,z=cropState.z||1,x=cropState.x||0,y=cropState.y||0;
    const outW=1024,outH=1024,f=window.cropFrame(),previewW=f.w,previewH=f.h;
    const base=Math.max(previewW/img.width,previewH/img.height)*z;
    const dispW=img.width*base,dispH=img.height*base;
    const scaleX=outW/previewW,scaleY=outH/previewH;
    const c=document.createElement('canvas');c.width=outW;c.height=outH;
    const ctx=c.getContext('2d',{alpha:true});
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const drawW=dispW*scaleX,drawH=dispH*scaleY;
    const dx=(outW-drawW)/2+x*scaleX,dy=(outH-drawH)/2+y*scaleY;
    ctx.drawImage(img,dx,dy,drawW,drawH);
    const data=c.toDataURL('image/png');
    if(type==='avatar'){
      window.pendingAvatarData=data;
      if($('profileAvatarPreview')) $('profileAvatarPreview').src=data;
    }else{
      pendingServerIconV032=data;
      if($('serverIconPreview')){
        $('serverIconPreview').style.backgroundImage=`url(${data})`;
        $('serverIconPreview').style.backgroundSize='cover';
        $('serverIconPreview').style.backgroundPosition='center';
      }
    }
    try{cropState.input.value=''}catch{}
    window.cropState=null;
    window.closeModal?.('cropModal');
  };

  const originalOpenServerSettings = window.openServerSettings;
  window.openServerSettings = async function(){
    await originalOpenServerSettings?.();
    pendingServerIconV032=null;
    if(!window.currentServer || !window.db) return;
    const s=await db.ref('servers/'+currentServer).once('value'),d=s.val()||{};
    const p=$('serverIconPreview');
    if(p){
      p.style.backgroundImage=d.icon?`url(${d.icon})`:'';
      p.style.backgroundSize='cover';p.style.backgroundPosition='center';
    }
  };

  window.saveServerSettings = async function(){
    if(!window.currentServer) return;
    const patch={name:$('serverEditName')?.value.trim()||'Servidor'};
    try{ if(window.pendingServerCover) patch.cover=window.pendingServerCover; }catch{}
    if(pendingServerIconV032) patch.icon=pendingServerIconV032;
    await db.ref('servers/'+currentServer).update(patch);
    window.closeModal?.('serverSettingsModal');
    window.toast?.('Servidor atualizado.');
    const s=await db.ref('servers/'+currentServer).once('value');
    window.selectServer?.(currentServer,s.val()||patch);
  };

  // Convites públicos e clicáveis dentro das mensagens.
  window.getPublicInviteBase = function(){ return 'https://nuvemfofa.netlify.app/'; };
  const originalCreateInvite = window.createServerInvite;
  window.createServerInvite = async function(){
    await originalCreateInvite?.();
    const input=$('inviteLink'); if(!input?.value) return;
    const m=input.value.match(/[?&]invite=([A-Za-z0-9_-]+)/i);
    if(m) input.value=`https://nuvemfofa.netlify.app/?invite=${encodeURIComponent(m[1])}`;
  };

  function inviteCodeFromText(text){
    const m=String(text||'').match(/https?:\/\/nuvemfofa\.netlify\.app\/?\?invite=([A-Za-z0-9_-]+)/i);
    return m?.[1]||null;
  }
  async function openInviteCode(code){
    if(!code||!window.db||!window.currentUser) return;
    const s=await db.ref('serverInvites/'+code).once('value');
    if(!s.exists()) return window.toast?.('Convite inválido ou expirado.');
    const inv=s.val(),sv=await db.ref('servers/'+inv.serverId).once('value');
    if(!sv.exists()) return window.toast?.('Servidor não existe mais.');
    const server=sv.val()||{};
    if(server.createdBy===currentUser.uid||server.members?.[currentUser.uid]) return window.toast?.('Você já participa deste servidor.');
    window.pendingInvite={code,...inv,server};
    if($('inviteJoinText')) $('inviteJoinText').innerHTML=`Você foi convidada para <b>${server.name||'Servidor'}</b>.`;
    window.openModal?.('inviteJoinModal');
  }
  function linkifyInvites(){
    document.querySelectorAll('.msg-text').forEach(el=>{
      if(el.dataset.nfLinked==='1') return;
      const text=el.textContent||'',code=inviteCodeFromText(text); if(!code) return;
      const url=`https://nuvemfofa.netlify.app/?invite=${encodeURIComponent(code)}`;
      el.textContent='';
      const a=document.createElement('a');a.className='nf-invite-link';a.href=url;a.textContent=url;a.title='Abrir convite do servidor';
      a.addEventListener('click',e=>{e.preventDefault();openInviteCode(code)});
      el.appendChild(a);el.dataset.nfLinked='1';
    });
  }
  const msgObs=new MutationObserver(linkifyInvites);
  msgObs.observe(document.documentElement,{subtree:true,childList:true});
  linkifyInvites();
})();
