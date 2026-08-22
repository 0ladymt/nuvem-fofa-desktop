// Nuvem Fofa v0.3.14 — seletor único de transmissão + pipeline definitivo de imagens
(() => {
  const $ = id => document.getElementById(id);
  const qa = (s,r=document)=>[...r.querySelectorAll(s)];
  const pending = { avatar:null, banner:null, serverIcon:null, serverCover:null };

  const css=document.createElement('style');
  css.textContent=`
    /* ===== TRANSMISSÃO: UMA ÚNICA CAMADA ===== */
    #sharePickerModal .nf-discord-picker-head,
    #sharePickerModal .nf-discord-bottom,
    #sharePickerModal .nf-stream-modebar,
    #sharePickerModal .nf-stream-pop{display:none!important}
    #sharePickerModal{background:rgba(0,0,0,.74)!important;backdrop-filter:blur(3px)}
    #sharePickerModal .share-picker-card{position:relative!important;width:min(820px,92vw)!important;max-height:min(720px,88vh)!important;background:#1b1c1f!important;border:1px solid #303238!important;border-radius:14px!important;box-shadow:0 24px 80px #000c!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
    #sharePickerModal .modal-head{display:none!important}
    #sharePickerModal .share-tabs{flex:0 0 auto!important;display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:4px!important;padding:5px!important;margin:0!important;background:#111214!important;border-bottom:1px solid #292b30!important}
    #sharePickerModal .share-tabs button{height:44px!important;border:0!important;border-radius:9px!important;background:transparent!important;color:#aeb3bb!important;font-size:14px!important;font-weight:700!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;cursor:pointer!important}
    #sharePickerModal .share-tabs button:hover{background:#202226!important;color:#fff!important}
    #sharePickerModal .share-tabs button.active{background:#2b2d31!important;color:#fff!important}
    #sharePickerModal .share-tabs svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.8}
    #sharePickerModal .nf314-source-area{flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;background:#1b1c1f!important}
    #sharePickerModal .share-sources{height:100%!important;max-height:none!important;overflow:auto!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;align-content:start!important;gap:12px!important;padding:16px!important;background:#1b1c1f!important}
    #sharePickerModal .share-source{border:2px solid transparent!important;border-radius:10px!important;background:#232428!important;padding:7px!important;color:#f2f3f5!important;text-align:left!important;cursor:pointer!important;transition:.12s ease!important;min-width:0!important}
    #sharePickerModal .share-source:hover{background:#2b2d31!important;border-color:#44474f!important}
    #sharePickerModal .share-source.active{border-color:#5865f2!important;background:#2b2d31!important}
    #sharePickerModal .share-source img{display:block!important;width:100%!important;aspect-ratio:16/9!important;object-fit:cover!important;border-radius:7px!important;margin:0 0 7px!important;background:#0d0e10!important;filter:none!important}
    #sharePickerModal .share-source-name{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:13px!important;font-weight:700!important}
    #sharePickerModal .nf314-empty{grid-column:1/-1;min-height:210px;display:grid;place-items:center;text-align:center;color:#949ba4;padding:30px}
    #sharePickerModal .nf314-config{flex:0 0 auto!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:16px 24px!important;padding:14px 16px 10px!important;background:#1b1c1f!important;border-top:1px solid #292b30!important}
    #sharePickerModal .share-options{display:contents!important}
    #sharePickerModal .share-options>div label{display:block!important;margin:0 0 7px!important;color:#949ba4!important;font-size:11px!important;font-weight:800!important;text-transform:uppercase!important}
    #sharePickerModal .share-choice-row{display:flex!important;gap:7px!important}
    #sharePickerModal .share-choice-row button{height:38px!important;min-width:70px!important;border:1px solid #3f4147!important;border-radius:7px!important;background:#232428!important;color:#dbdee1!important;padding:0 13px!important;cursor:pointer!important}
    #sharePickerModal .share-choice-row button:hover{background:#35373c!important}
    #sharePickerModal .share-choice-row button.active{background:#5865f2!important;border-color:#5865f2!important;color:white!important}
    #sharePickerModal .share-audio-toggle{grid-column:1/-1!important;display:flex!important;align-items:center!important;gap:9px!important;margin:0!important;padding:0 0 3px!important;color:#dbdee1!important;font-size:13px!important;font-weight:600!important}
    #sharePickerModal .share-audio-toggle input{width:17px!important;height:17px!important;accent-color:#5865f2!important}
    #sharePickerModal .modal-actions{flex:0 0 auto!important;display:flex!important;align-items:center!important;padding:10px 16px 14px!important;background:#1b1c1f!important;border:0!important;gap:8px!important}
    #sharePickerModal .modal-actions:before{content:'';flex:1}
    #sharePickerModal .modal-actions button{height:40px!important;border-radius:7px!important;padding:0 15px!important}
    #sharePickerModal .nf314-modebar{flex:0 0 auto!important;display:flex!important;align-items:center!important;gap:12px!important;padding:11px 14px!important;background:#111214!important;border-top:1px solid #292b30!important}
    #sharePickerModal .nf314-modecopy{min-width:0;flex:1}.nf314-modecopy b{display:block;font-size:13px;color:#f2f3f5}.nf314-modecopy small{display:block;margin-top:2px;color:#949ba4;font-size:11px}
    #sharePickerModal .nf314-gear{width:38px;height:38px;border:0;border-radius:8px;background:#232428;color:#dbdee1;display:grid;place-items:center;cursor:pointer}
    #sharePickerModal .nf314-gear:hover{background:#35373c;color:#fff}
    #sharePickerModal .nf314-pop{position:absolute;right:14px;bottom:58px;width:278px;background:#111214;border:1px solid #303238;border-radius:10px;padding:7px;box-shadow:0 18px 60px #000d;z-index:30}
    #sharePickerModal .nf314-pop-title{padding:6px 8px;color:#949ba4;font-size:11px;text-transform:uppercase;font-weight:800}
    #sharePickerModal .nf314-pop button{width:100%;border:0;background:transparent;color:#dbdee1;text-align:left;padding:9px 10px;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:9px}
    #sharePickerModal .nf314-pop button:hover{background:#35373c}.nf314-pop button.active{color:#fff}
    #sharePickerModal .nf314-radio{margin-left:auto;width:16px;height:16px;border-radius:50%;border:2px solid #72767d;display:grid;place-items:center}.nf314-pop button.active .nf314-radio:after{content:'';width:8px;height:8px;border-radius:50%;background:#5865f2}
    @media(max-width:720px){#sharePickerModal .share-sources{grid-template-columns:1fr!important}#sharePickerModal .nf314-config{grid-template-columns:1fr!important}.share-audio-toggle{grid-column:1!important}}

    /* ===== IMAGENS ===== */
    #profileAvatarPreview,#meAvatar,#viewUserAvatar,.avatar,.msg-avatar,.voice-avatar-xl,#serverIconPreview,#serverCoverPreview,#profileBanner,#viewUserBanner{filter:none!important;-webkit-filter:none!important;mix-blend-mode:normal!important;opacity:1!important}
  `;
  document.head.appendChild(css);

  const icons={
    app:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18"/></svg>',
    screen:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    device:'<svg viewBox="0 0 24 24"><path d="M4 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><path d="m18 10 4-2v8l-4-2"/></svg>',
    gear:'<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.7 2.1-1.6-.5a7.9 7.9 0 0 0-.7-1.6l.8-1.5-2.2-2.2-1.5.8a7.9 7.9 0 0 0-1.6-.7L13.4 3h-2.8l-.5 1.9a7.9 7.9 0 0 0-1.6.7L7 4.8 4.8 7l.8 1.5a7.9 7.9 0 0 0-.7 1.6l-1.9.5v2.8l1.9.5c.2.6.4 1.1.7 1.6L4.8 17 7 19.2l1.5-.8c.5.3 1 .5 1.6.7l.5 1.9h2.8l.5-1.9c.6-.2 1.1-.4 1.6-.7l1.5.8 2.2-2.2-.8-1.5c.3-.5.5-1 .7-1.6l1.6-.5v-2.8Z"/></svg>'
  };

  // ---------- imagem: crop final independente dos overrides antigos ----------
  function makeCropData(){
    if(!cropState?.img)return null;
    const type=cropState.type;
    const square=type==='avatar'||type==='serverIcon';
    const outW=square?512:1280, outH=square?512:430;
    const img=cropState.img, frame=cropFrame();
    const z=Math.max(1,Number(cropState.z)||1),x=Number(cropState.x)||0,y=Number(cropState.y)||0;
    const base=Math.max(frame.w/img.width,frame.h/img.height)*z;
    const srcW=Math.min(img.width,frame.w/base),srcH=Math.min(img.height,frame.h/base);
    const sx=Math.max(0,Math.min(img.width-srcW,(img.width-srcW)/2-x/base));
    const sy=Math.max(0,Math.min(img.height-srcH,(img.height-srcH)/2-y/base));
    const c=document.createElement('canvas');c.width=outW;c.height=outH;
    const ctx=c.getContext('2d',{alpha:true});ctx.clearRect(0,0,outW,outH);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,sx,sy,srcW,srcH,0,0,outW,outH);
    return c.toDataURL('image/webp',.90);
  }

  window.nf314ApplyCrop=function(){
    if(!cropState)return;
    const type=cropState.type,data=makeCropData();if(!data)return toast('Não consegui preparar essa imagem.');
    if(type==='avatar'){pending.avatar=data;pendingAvatarData=data;if($('profileAvatarPreview'))$('profileAvatarPreview').src=data}
    else if(type==='banner'){pending.banner=data;pendingBannerData=data;if($('profileBanner'))$('profileBanner').style.backgroundImage=`url("${data}")`}
    else if(type==='serverIcon'){pending.serverIcon=data;window.pendingServerIcon=data;const p=$('serverIconPreview');if(p){p.style.backgroundImage=`url("${data}")`;p.textContent=''}}
    else if(type==='serverBanner'){pending.serverCover=data;pendingServerCover=data;if($('serverCoverPreview'))$('serverCoverPreview').style.backgroundImage=`url("${data}")`}
    try{cropState.input.value=''}catch{}
    cropState=null;closeModal('cropModal');
  };
  window.applyCrop=window.nf314ApplyCrop;

  function bindCropApply(){
    const btn=qa('#cropModal .modal-actions button').find(b=>/aplicar/i.test(b.textContent||''));
    if(btn){btn.removeAttribute('onclick');btn.onclick=e=>{e.preventDefault();e.stopPropagation();window.nf314ApplyCrop()}}
  }
  bindCropApply();

  const oldOpenProfile=window.openProfile||openProfile;
  window.openProfile=function(){oldOpenProfile();pending.avatar=null;pending.banner=null;setTimeout(bindCropApply,0)};

  window.saveProfile=async function(){
    if(!currentUser||!db)return;
    const uid=currentUser.uid;
    const textPatch={username:$('profileUsername')?.value?.trim()||currentUserData?.username||'Usuário',status:$('profileStatus')?.value?.trim()||'',bio:$('profileBio')?.value?.trim()||'',updatedAt:firebase.database.ServerValue.TIMESTAMP};
    const avatar=pending.avatar||pendingAvatarData||null;
    const banner=pending.banner||pendingBannerData||null;
    try{
      await db.ref(`users/${uid}`).update(textPatch);
      if(avatar)await db.ref(`users/${uid}/avatar`).set(avatar);
      if(banner)await db.ref(`users/${uid}/banner`).set(banner);
      const snap=await db.ref(`users/${uid}`).once('value'),saved=snap.val()||{};
      if(avatar&&saved.avatar!==avatar)throw new Error('foto de perfil não confirmada pelo banco');
      if(banner&&saved.banner!==banner)throw new Error('capa do perfil não confirmada pelo banco');
      currentUserData=saved;pending.avatar=null;pending.banner=null;pendingAvatarData=null;pendingBannerData=null;
      if($('meAvatar'))$('meAvatar').src=imgFor(saved);if($('profileAvatarPreview'))$('profileAvatarPreview').src=imgFor(saved);if($('profileBanner'))$('profileBanner').style.backgroundImage=saved.banner?`url("${saved.banner}")`:'';
      if(voiceRoom)await db.ref(`voiceParticipants/${voiceRoom.channelId}/${uid}`).update({avatar:saved.avatar||'',username:saved.username||'Usuário'}).catch(()=>{});
      qa(`[data-voice-user="${uid}"] img`).forEach(i=>i.src=imgFor(saved));
      if(typeof renderVoicePanel==='function'&&voiceRoom)renderVoicePanel();if(typeof refreshVoiceCallGrid==='function'&&voiceRoom)refreshVoiceCallGrid();if(typeof loadServers==='function'){};
      closeModal('profileModal');toast('Perfil e imagens salvos com sucesso.');
    }catch(e){console.error('[v0.3.14 profile image save]',e);toast('Falha ao salvar imagem: '+(e.message||'erro desconhecido'));}
  };

  const oldOpenServer=window.openServerSettings||openServerSettings;
  window.openServerSettings=async function(){await oldOpenServer();pending.serverIcon=null;pending.serverCover=null;const s=await db.ref(`servers/${currentServer}`).once('value'),d=s.val()||{};const p=$('serverIconPreview');if(p){p.style.backgroundImage=d.icon?`url("${d.icon}")`:'';p.textContent=d.icon?'':(d.name||'S').slice(0,1).toUpperCase()}if($('serverCoverPreview'))$('serverCoverPreview').style.backgroundImage=d.cover?`url("${d.cover}")`:'';setTimeout(bindCropApply,0)};

  window.saveServerSettings=async function(){
    if(!currentServer||!db)return;
    const sid=currentServer,name=$('serverEditName')?.value?.trim()||'Servidor';
    const icon=pending.serverIcon||window.pendingServerIcon||null;
    const cover=pending.serverCover||pendingServerCover||null;
    try{
      await db.ref(`servers/${sid}/name`).set(name);
      if(icon)await db.ref(`servers/${sid}/icon`).set(icon);
      if(cover)await db.ref(`servers/${sid}/cover`).set(cover);
      const snap=await db.ref(`servers/${sid}`).once('value'),saved=snap.val()||{};
      if(icon&&saved.icon!==icon)throw new Error('foto do servidor não confirmada pelo banco');
      if(cover&&saved.cover!==cover)throw new Error('capa do servidor não confirmada pelo banco');
      pending.serverIcon=null;pending.serverCover=null;window.pendingServerIcon=null;pendingServerCover=null;
      closeModal('serverSettingsModal');if(typeof loadServers==='function')loadServers();selectServer(sid,saved);toast('Servidor e imagens salvos com sucesso.');
    }catch(e){console.error('[v0.3.14 server image save]',e);toast('Falha ao salvar imagem do servidor: '+(e.message||'erro desconhecido'));}
  };

  // ---------- transmissão: remove injeções antigas e monta uma única interface ----------
  function cleanLegacyShare(){
    const m=$('sharePickerModal');if(!m)return;
    qa('.nf-discord-picker-head,.nf-discord-bottom,.nf-stream-modebar,.nf-stream-pop',m).forEach(x=>x.remove());
    qa('.nf-device-tab',m).forEach(x=>x.remove());
  }

  function ensureShareStructure(){
    const m=$('sharePickerModal'),card=m?.querySelector('.share-picker-card');if(!card)return;
    cleanLegacyShare();
    const tabs=card.querySelector('.share-tabs');
    if(tabs&&!$('shareTabDevices')){
      $('shareTabApps').innerHTML=icons.app+'<span>Aplicativos</span>';$('shareTabScreens').innerHTML=icons.screen+'<span>Tela Inteira</span>';
      const d=document.createElement('button');d.id='shareTabDevices';d.innerHTML=icons.device+'<span>Dispositivos</span>';d.onclick=()=>setShareTab314('device');tabs.appendChild(d);
    }
    let src=card.querySelector('#shareSources');
    if(src&&!src.parentElement.classList.contains('nf314-source-area')){const wrap=document.createElement('div');wrap.className='nf314-source-area';src.replaceWith(wrap);wrap.appendChild(src)}
    const opts=card.querySelector('.share-options');if(opts&&!opts.parentElement.classList.contains('nf314-config')){const conf=document.createElement('div');conf.className='nf314-config';opts.replaceWith(conf);conf.appendChild(opts)}
    if(!card.querySelector('.nf314-modebar')){
      const bar=document.createElement('div');bar.className='nf314-modebar';bar.innerHTML=`<div class="nf314-modecopy"><b>Jogos</b><small>Vídeo mais suave · 1080p · 60fps</small></div><button class="nf314-gear" title="Modo de transmissão">${icons.gear}</button>`;card.appendChild(bar);
      bar.querySelector('.nf314-gear').onclick=e=>{e.stopPropagation();toggleModePop(card)};
    }
    updateModeCopy();
  }

  function setShareTab314(tab){
    cleanLegacyShare();ensureShareStructure();
    if(tab==='device'){
      sharePickerState.tab='device';sharePickerState.sourceId=null;$('shareTabApps')?.classList.remove('active');$('shareTabScreens')?.classList.remove('active');$('shareTabDevices')?.classList.add('active');
      const box=$('shareSources');if(box)box.innerHTML='<div class="nf314-empty"><div><b>Dispositivos de vídeo</b><br><span style="font-size:12px">Esta área fica separada das fontes de tela. Nenhuma tela será exibida aqui.</span></div></div>';
      if($('shareStartBtn'))$('shareStartBtn').disabled=true;return;
    }
    $('shareTabDevices')?.classList.remove('active');setShareTab(tab);ensureShareStructure();
  }

  function toggleModePop(card){
    let p=card.querySelector('.nf314-pop');if(p){p.remove();return}
    p=document.createElement('div');p.className='nf314-pop';p.innerHTML=`<div class="nf314-pop-title">Modo de transmissão</div><button class="active" data-mode="games"><span><b>Jogos</b><br><small>Vídeo mais suave</small></span><span class="nf314-radio"></span></button><button data-mode="text"><span><b>Compartilhamento de tela</b><br><small>Texto mais claro</small></span><span class="nf314-radio"></span></button><button data-mode="custom"><span><b>Personalizada</b></span><span class="nf314-radio"></span></button><div class="nf314-pop-title">Áudio</div><button data-audio><span>Compartilhar áudio do sistema</span><span>${$('shareAudioToggle')?.checked===false?'':'✓'}</span></button>`;
    card.appendChild(p);
    qa('button[data-mode]',p).forEach(b=>b.onclick=()=>{qa('button[data-mode]',p).forEach(x=>x.classList.toggle('active',x===b));window.__nf314Mode=b.dataset.mode;updateModeCopy();p.remove()});
    p.querySelector('[data-audio]').onclick=()=>{const c=$('shareAudioToggle');if(c)c.checked=!c.checked;p.remove()};
  }

  function updateModeCopy(){
    const s=sharePickerState||{},bar=$('sharePickerModal')?.querySelector('.nf314-modecopy');if(!bar)return;const mode=window.__nf314Mode||'games';const label=mode==='text'?'Compartilhamento de tela':mode==='custom'?'Personalizada':'Jogos';const sub=mode==='text'?'Texto mais claro':mode==='custom'?'Configuração escolhida':`Vídeo mais suave · ${s.quality||1080}p · ${s.fps||60}fps`;bar.innerHTML=`<b>${label}</b><small>${sub}</small>`;
  }

  const oldSetTab=window.setShareTab||setShareTab;
  window.setShareTab=function(tab){if(tab==='device')return setShareTab314('device');const r=oldSetTab(tab);setTimeout(()=>{ensureShareStructure();updateModeCopy()},0);return r};
  const oldQuality=window.chooseShareQuality||chooseShareQuality;window.chooseShareQuality=function(v,b){const r=oldQuality(v,b);updateModeCopy();return r};
  const oldFps=window.chooseShareFps||chooseShareFps;window.chooseShareFps=function(v,b){const r=oldFps(v,b);updateModeCopy();return r};
  const oldOpenShare=window.openSharePicker||openSharePicker;window.openSharePicker=async function(){const r=await oldOpenShare();setTimeout(()=>{cleanLegacyShare();ensureShareStructure()},20);return r};

  document.addEventListener('click',e=>{if(!e.target.closest('.nf314-pop')&&!e.target.closest('.nf314-gear'))qa('#sharePickerModal .nf314-pop').forEach(x=>x.remove())},true);
  const obs=new MutationObserver(()=>requestAnimationFrame(()=>{if($('sharePickerModal')?.classList.contains('active')){cleanLegacyShare();ensureShareStructure()}bindCropApply()}));
  obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

  console.info('[Nuvem Fofa] v0.3.14 share/images fix carregado');
})();
