// Nuvem Fofa v0.3.13 — titlebar integrada, seletor de transmissão e persistência real das imagens
(() => {
  const $ = id => document.getElementById(id);
  const qa = (s,r=document)=>[...r.querySelectorAll(s)];
  const sleep = ms => new Promise(r=>setTimeout(r,ms));

  const css = document.createElement('style');
  css.textContent = `
    :root{--nf-titlebar-h:32px}
    html,body{background:#1e1f22!important}
    body{padding-top:var(--nf-titlebar-h)!important;height:100vh!important}
    #nfDesktopTitlebar{position:fixed;left:0;right:0;top:0;height:var(--nf-titlebar-h);z-index:2147483647;background:#1e1f22;color:#b5bac1;display:flex;align-items:center;-webkit-app-region:drag;user-select:none;border-bottom:1px solid #17181a}
    #nfDesktopTitlebar .nf-title-left{height:100%;display:flex;align-items:center;gap:8px;padding-left:10px;min-width:180px}
    #nfDesktopTitlebar .nf-title-icon{width:18px;height:18px;object-fit:contain}
    #nfDesktopTitlebar .nf-title-name{font-size:12px;font-weight:700;color:#dbdee1}
    #nfDesktopTitlebar .nf-title-center{flex:1;text-align:center;font-size:11px;color:#949ba4;pointer-events:none}
    #nfDesktopTitlebar .nf-window-actions{height:100%;display:flex;-webkit-app-region:no-drag}
    #nfDesktopTitlebar .nf-window-btn{width:46px;height:100%;border:0;background:transparent;color:#b5bac1;display:grid;place-items:center;cursor:pointer;padding:0}
    #nfDesktopTitlebar .nf-window-btn:hover{background:#35373c;color:#fff}
    #nfDesktopTitlebar .nf-window-btn.close:hover{background:#da373c;color:#fff}
    #nfDesktopTitlebar svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.7}
    body.nf-native-fullscreen{padding-top:0!important}
    body.nf-native-fullscreen #nfDesktopTitlebar{display:none!important}

    /* Seletor de transmissão com composição próxima do desktop do Discord */
    #sharePickerModal .share-picker-card,.nf-discord-share-shell{width:min(900px,94vw)!important;max-height:min(760px,90vh)!important;background:#18191c!important;border:1px solid #2f3136!important;border-radius:14px!important;overflow:hidden!important;box-shadow:0 26px 80px #000b!important}
    #sharePickerModal .modal-head{display:none!important}
    #sharePickerModal .share-tabs{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:3px!important;margin:0!important;padding:5px!important;background:#0f1012!important;border-bottom:0!important}
    #sharePickerModal .share-tabs button{height:44px!important;border:0!important;border-radius:9px!important;background:transparent!important;color:#b5bac1!important;font-weight:700!important}
    #sharePickerModal .share-tabs button.active{background:#232428!important;color:#fff!important}
    #sharePickerModal .share-tabs .nf-device-tab{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important}
    #sharePickerModal .share-sources{padding:18px 18px 8px!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important;max-height:430px!important;overflow:auto!important;background:#18191c!important}
    #sharePickerModal .share-source{background:#232428!important;border:2px solid transparent!important;border-radius:10px!important;overflow:hidden!important;padding:8px!important;transition:.12s!important}
    #sharePickerModal .share-source:hover{background:#2b2d31!important;border-color:#4e5058!important}
    #sharePickerModal .share-source.active,#sharePickerModal .share-source.selected{border-color:#5865f2!important}
    #sharePickerModal .share-source img{width:100%!important;aspect-ratio:16/9!important;object-fit:cover!important;border-radius:7px!important;filter:none!important;mix-blend-mode:normal!important}
    #sharePickerModal .share-source .name,#sharePickerModal .share-source b{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;margin-top:7px!important}
    #sharePickerModal .share-options{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px 22px!important;padding:12px 18px 6px!important;background:#18191c!important;border-top:1px solid #2b2d31!important}
    #sharePickerModal .share-options>div label{display:block!important;color:#949ba4!important;font-size:11px!important;font-weight:800!important;text-transform:uppercase!important;margin-bottom:7px!important}
    #sharePickerModal .share-choice-row{display:flex!important;gap:7px!important}
    #sharePickerModal .share-choice-row button{min-width:72px!important;border:1px solid #3f4147!important;background:#232428!important;color:#dbdee1!important;border-radius:6px!important;padding:9px 12px!important}
    #sharePickerModal .share-choice-row button.active{background:#5865f2!important;border-color:#5865f2!important;color:#fff!important}
    #sharePickerModal .share-audio-toggle{grid-column:1/-1!important;display:flex!important;align-items:center!important;gap:9px!important;color:#dbdee1!important;padding:3px 0 8px!important}
    #sharePickerModal .modal-actions{background:#18191c!important;border-top:0!important;padding:8px 18px 18px!important}
    #sharePickerModal .modal-actions button{min-height:40px!important}
    #sharePickerModal .nf-stream-modebar{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#111214;border-top:1px solid #2b2d31}
    #sharePickerModal .nf-stream-modecopy{min-width:0;flex:1}.nf-stream-modecopy b{display:block;font-size:14px}.nf-stream-modecopy small{color:#949ba4}
    #sharePickerModal .nf-stream-gear{width:40px;height:40px;border:0;border-radius:8px;background:#232428;color:#fff;display:grid;place-items:center;cursor:pointer}
    #sharePickerModal .nf-stream-pop{position:absolute;right:18px;bottom:60px;width:280px;background:#111214;border:1px solid #2f3136;border-radius:10px;padding:8px;box-shadow:0 18px 50px #000b;z-index:20}
    #sharePickerModal .nf-stream-pop h4{margin:7px 8px 5px;font-size:12px;color:#949ba4;text-transform:uppercase}
    #sharePickerModal .nf-mode-option{width:100%;border:0;background:transparent;color:#dbdee1;border-radius:6px;padding:9px 10px;display:flex;justify-content:space-between;align-items:center;text-align:left;cursor:pointer}
    #sharePickerModal .nf-mode-option:hover{background:#35373c}.nf-mode-option.active{color:#fff}.nf-radio{width:16px;height:16px;border:2px solid #80848e;border-radius:50%;display:grid;place-items:center}.active .nf-radio:after{content:'';width:8px;height:8px;border-radius:50%;background:#5865f2}
    @media(max-width:760px){#sharePickerModal .share-sources{grid-template-columns:1fr!important}#sharePickerModal .share-options{grid-template-columns:1fr!important}.share-audio-toggle{grid-column:1!important}}

    /* Imagens devem manter as cores originais */
    img,.avatar,.msg-avatar,.profile-avatar-hd,.voice-avatar-xl,#profileAvatarPreview,#viewUserAvatar,#serverIconPreview,#serverCoverPreview,#profileBanner,#viewUserBanner{filter:none!important;-webkit-filter:none!important;mix-blend-mode:normal!important;opacity:1!important}
    #profileAvatarPreview,#viewUserAvatar,.avatar,.msg-avatar,.voice-avatar-xl{background-color:transparent!important}

    /* Configurações do servidor: identidade primeiro e organização horizontal */
    #serverSettingsModal .modal-card{width:min(980px,96vw)!important;max-height:88vh!important;overflow:hidden!important}
    #serverSettingsModal .modal-body{overflow:auto!important;max-height:calc(88vh - 126px)!important;padding:18px!important}
    #serverSettingsModal .nf-server-columns{display:grid!important;grid-template-columns:minmax(390px,.95fr) minmax(400px,1.05fr)!important;gap:16px!important}
    #serverSettingsModal .nf-server-section{background:#2b2d31!important;border:1px solid #3a3c42!important;border-radius:10px!important;padding:16px!important}
    #serverSettingsModal .nf-server-identity{display:flex!important;flex-direction:column!important;gap:14px!important}
    #serverSettingsModal .nf-server-identity .field{order:1!important;margin:0!important}
    #serverSettingsModal .nf-server-identity .server-icon-row{order:2!important;margin:0!important;padding:2px 0 0!important}
    #serverSettingsModal .nf-server-identity #serverCoverPreview{order:3!important;margin:0!important;height:150px!important;border-radius:8px!important}
    #serverSettingsModal .nf-server-identity .nf-cover-button{order:4!important;width:max-content!important}
    #serverSettingsModal .nf-server-identity .notice{order:5!important;margin:0!important}
    #serverSettingsModal .server-icon-preview{width:82px!important;height:82px!important;border-radius:24px!important;background-size:cover!important;background-position:center!important;flex:0 0 auto!important}
    #serverSettingsModal .server-preview{background-size:cover!important;background-position:center!important}
    @media(max-width:820px){#serverSettingsModal .nf-server-columns{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(css);

  const ico = {
    min:'<svg viewBox="0 0 16 16"><path d="M3 8h10"/></svg>',
    max:'<svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx=".5"/></svg>',
    restore:'<svg viewBox="0 0 16 16"><rect x="5" y="3" width="8" height="8"/><path d="M3 5v8h8"/></svg>',
    close:'<svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13"/></svg>',
    gear:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm9.4 2.2-1.7-.5a8 8 0 0 0-.7-1.7l.9-1.5-2.9-2.9-1.5.9a8 8 0 0 0-1.7-.7L13.3 2h-2.6l-.5 1.7a8 8 0 0 0-1.7.7L7 3.5 4.1 6.4 5 7.9a8 8 0 0 0-.7 1.7l-1.7.5v3.8l1.7.5a8 8 0 0 0 .7 1.7l-.9 1.5L7 20.5l1.5-.9a8 8 0 0 0 1.7.7l.5 1.7h2.6l.5-1.7a8 8 0 0 0 1.7-.7l1.5.9 2.9-2.9-.9-1.5a8 8 0 0 0 .7-1.7l1.7-.5v-3.8Z"/></svg>'
  };

  // ---------- TITLEBAR NATIVA ----------
  async function installTitlebar(){
    if(!window.nuvemDesktop?.isDesktop || $('nfDesktopTitlebar')) return;
    const bar=document.createElement('div');bar.id='nfDesktopTitlebar';
    bar.innerHTML=`<div class="nf-title-left"><img class="nf-title-icon" src="../assets/nuvem-fofa-32.png"><span class="nf-title-name">Nuvem Fofa</span></div><div class="nf-title-center"></div><div class="nf-window-actions"><button class="nf-window-btn min" title="Minimizar">${ico.min}</button><button class="nf-window-btn max" title="Maximizar">${ico.max}</button><button class="nf-window-btn close" title="Fechar">${ico.close}</button></div>`;
    document.body.prepend(bar);
    const max=bar.querySelector('.max');
    const apply=s=>{document.body.classList.toggle('nf-native-fullscreen',!!s?.fullscreen);max.innerHTML=s?.maximized?ico.restore:ico.max;max.title=s?.maximized?'Restaurar':'Maximizar'};
    bar.querySelector('.min').onclick=()=>window.nuvemDesktop.minimizeWindow?.();
    max.onclick=()=>window.nuvemDesktop.toggleMaximizeWindow?.();
    bar.querySelector('.close').onclick=()=>window.nuvemDesktop.closeWindow?.();
    try{apply(await window.nuvemDesktop.getWindowState?.())}catch{}
    window.nuvemDesktop.onWindowState?.(apply);
  }

  // ---------- PIPELINE DE IMAGENS ----------
  function renderServerIcon(el,data,name='S'){
    if(!el)return;
    if(data){el.style.backgroundImage=`url("${data}")`;el.style.backgroundColor='transparent';el.textContent=''}
    else{el.style.backgroundImage='';el.textContent=(name||'S').slice(0,1).toUpperCase()}
  }
  function renderServerCover(el,data){if(el){el.style.backgroundImage=data?`url("${data}")`:'';el.style.backgroundColor=data?'transparent':''}}

  function exportCurrentCrop(){
    if(!cropState?.img)return null;
    const type=cropState.type;
    const avatarLike=type==='avatar'||type==='serverIcon';
    const outW=avatarLike?640:1280,outH=avatarLike?640:430;
    const img=cropState.img,z=cropState.z||1,x=cropState.x||0,y=cropState.y||0;
    const frame=cropFrame();
    const base=Math.max(frame.w/img.width,frame.h/img.height)*z;
    const srcW=Math.min(img.width,frame.w/base),srcH=Math.min(img.height,frame.h/base);
    const sx=Math.max(0,Math.min(img.width-srcW,(img.width-srcW)/2-x/base));
    const sy=Math.max(0,Math.min(img.height-srcH,(img.height-srcH)/2-y/base));
    const c=document.createElement('canvas');c.width=outW;c.height=outH;
    const ctx=c.getContext('2d',{alpha:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.clearRect(0,0,outW,outH);ctx.drawImage(img,sx,sy,srcW,srcH,0,0,outW,outH);
    return c.toDataURL('image/png');
  }

  window.applyCrop=function(){
    if(!cropState)return;
    const data=exportCurrentCrop();if(!data)return;
    const type=cropState.type;
    if(type==='avatar'){
      pendingAvatarData=data;window.__nfPendingAvatar=data;
      if($('profileAvatarPreview'))$('profileAvatarPreview').src=data;
    }else if(type==='banner'){
      pendingBannerData=data;window.__nfPendingBanner=data;
      if($('profileBanner'))$('profileBanner').style.backgroundImage=`url("${data}")`;
    }else if(type==='serverIcon'){
      window.pendingServerIcon=data;window.__nfPendingServerIcon=data;
      renderServerIcon($('serverIconPreview'),data);
    }else if(type==='serverBanner'){
      pendingServerCover=data;window.__nfPendingServerCover=data;
      renderServerCover($('serverCoverPreview'),data);
    }
    try{cropState.input.value=''}catch{}
    cropState=null;closeModal('cropModal');
  };

  window.saveProfile=async function(){
    if(!currentUser)return;
    const uid=currentUser.uid;
    const patch={
      username:$('profileUsername')?.value?.trim()||currentUserData?.username||'Usuário',
      status:$('profileStatus')?.value?.trim()||'',
      bio:$('profileBio')?.value?.trim()||'',
      updatedAt:firebase.database.ServerValue.TIMESTAMP
    };
    const av=window.__nfPendingAvatar||pendingAvatarData;
    const bn=window.__nfPendingBanner||pendingBannerData;
    if(av)patch.avatar=av;if(bn)patch.banner=bn;
    try{
      await db.ref('users/'+uid).update(patch);
      const check=(await db.ref('users/'+uid).once('value')).val()||{};
      if(av&&check.avatar!==av)throw new Error('A foto de perfil não foi persistida.');
      if(bn&&check.banner!==bn)throw new Error('A capa do perfil não foi persistida.');
      currentUserData=check;
      pendingAvatarData=null;pendingBannerData=null;window.__nfPendingAvatar=null;window.__nfPendingBanner=null;
      if($('meAvatar'))$('meAvatar').src=imgFor(check);
      if($('profileAvatarPreview'))$('profileAvatarPreview').src=imgFor(check);
      if($('profileBanner'))$('profileBanner').style.backgroundImage=check.banner?`url("${check.banner}")`:'';
      qa(`[data-voice-user="${uid}"] img`).forEach(i=>i.src=imgFor(check));
      if(voiceRoom){await db.ref(`voiceParticipants/${voiceRoom.channelId}/${uid}`).update({avatar:check.avatar||'',username:check.username||'Usuário'}).catch(()=>{});renderVoicePanel();refreshVoiceCallGrid();refreshVoiceSidebarParticipants();}
      if(typeof loadServers==='function')loadServers();
      closeModal('profileModal');toast('Perfil e imagens atualizados.');
    }catch(e){console.error('[v0.3.13 profile]',e);toast('Não foi possível salvar as imagens: '+(e.message||'erro desconhecido'));}
  };

  const previousOpenServerSettings=window.openServerSettings;
  window.openServerSettings=async function(){
    if(typeof previousOpenServerSettings==='function')await previousOpenServerSettings();
    if(!currentServer)return;
    try{
      const data=(await db.ref('servers/'+currentServer).once('value')).val()||{};
      renderServerIcon($('serverIconPreview'),data.icon||'',data.name||'S');
      renderServerCover($('serverCoverPreview'),data.cover||'');
      window.__nfPendingServerIcon=null;window.__nfPendingServerCover=null;window.pendingServerIcon=null;pendingServerCover=null;
      const modal=$('serverSettingsModal');
      const identity=modal?.querySelector('.nf-server-columns .nf-server-col:first-child .nf-server-section')||modal?.querySelector('.nf-server-section')||modal?.querySelector('.modal-body');
      if(identity){identity.classList.add('nf-server-identity');const name=$('serverEditName')?.closest('.field');if(name)identity.prepend(name);const coverBtn=$('serverCoverInput')?.nextElementSibling;if(coverBtn)coverBtn.classList.add('nf-cover-button')}
    }catch(e){console.warn('[v0.3.13 server open]',e)}
  };

  window.saveServerSettings=async function(){
    if(!currentServer)return;
    const sid=currentServer;
    const patch={name:$('serverEditName')?.value?.trim()||'Servidor',updatedAt:firebase.database.ServerValue.TIMESTAMP};
    const icon=window.__nfPendingServerIcon||window.pendingServerIcon;
    const cover=window.__nfPendingServerCover||pendingServerCover;
    if(icon)patch.icon=icon;if(cover)patch.cover=cover;
    try{
      await db.ref('servers/'+sid).update(patch);
      const check=(await db.ref('servers/'+sid).once('value')).val()||{};
      if(icon&&check.icon!==icon)throw new Error('A foto do servidor não foi persistida.');
      if(cover&&check.cover!==cover)throw new Error('A capa do servidor não foi persistida.');
      window.__nfPendingServerIcon=null;window.__nfPendingServerCover=null;window.pendingServerIcon=null;pendingServerCover=null;
      renderServerIcon($('serverIconPreview'),check.icon||'',check.name||'S');renderServerCover($('serverCoverPreview'),check.cover||'');
      closeModal('serverSettingsModal');
      await selectServer(sid,check);
      if(typeof loadServers==='function')loadServers();
      toast('Servidor e imagens atualizados.');
    }catch(e){console.error('[v0.3.13 server save]',e);toast('Não foi possível salvar as imagens do servidor: '+(e.message||'erro desconhecido'));}
  };

  // ---------- TRANSMISSÃO ----------
  function ensureDeviceTab(){
    const tabs=$('sharePickerModal')?.querySelector('.share-tabs');if(!tabs||tabs.querySelector('.nf-device-tab'))return;
    const b=document.createElement('button');b.className='nf-device-tab';b.innerHTML='<span>▣</span><span>Dispositivos</span>';b.onclick=()=>toast('Dispositivos de vídeo ficarão disponíveis aqui.');tabs.appendChild(b);
  }
  function ensureModeBar(){
    const card=$('sharePickerModal')?.querySelector('.share-picker-card');if(!card||card.querySelector('.nf-stream-modebar'))return;
    const bar=document.createElement('div');bar.className='nf-stream-modebar';
    const s=window.nfShareSettings||{height:1080,fps:60};
    bar.innerHTML=`<div class="nf-stream-modecopy"><b>Jogos</b><small>Vídeo mais suave · ${s.height||1080}p · ${s.fps||60}fps</small></div><button class="nf-stream-gear" title="Modo de transmissão">${ico.gear}</button>`;
    card.appendChild(bar);
    const gear=bar.querySelector('.nf-stream-gear');
    gear.onclick=e=>{e.stopPropagation();let pop=card.querySelector('.nf-stream-pop');if(pop){pop.remove();return}pop=document.createElement('div');pop.className='nf-stream-pop';pop.innerHTML=`<h4>Modo de transmissão</h4><button class="nf-mode-option active"><span><b>Jogos</b><br><small>Vídeo mais suave</small></span><span class="nf-radio"></span></button><button class="nf-mode-option"><span><b>Compartilhamento de tela</b><br><small>Texto mais claro</small></span><span class="nf-radio"></span></button><button class="nf-mode-option"><span><b>Personalizada</b></span><span class="nf-radio"></span></button><h4>Áudio</h4><button class="nf-mode-option"><span>Silenciar áudio da transmissão</span><span></span></button><button class="nf-mode-option"><span>Avançado</span><span>›</span></button>`;card.appendChild(pop)};
  }
  function polishShare(){ensureDeviceTab();ensureModeBar()}
  const obs=new MutationObserver(()=>requestAnimationFrame(polishShare));obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',e=>{const pop=document.querySelector('#sharePickerModal .nf-stream-pop');if(pop&&!e.target.closest('.nf-stream-pop')&&!e.target.closest('.nf-stream-gear'))pop.remove()},true);

  installTitlebar();polishShare();
  console.info('[Nuvem Fofa] v0.3.13 desktop polish carregado');
})();
