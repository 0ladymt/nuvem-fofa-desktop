// Nuvem Fofa v0.3.12 — áudio da call, imagens de perfil/servidor e organização dos painéis
(() => {
  const $ = id => document.getElementById(id);
  const qa = (s,r=document)=>[...r.querySelectorAll(s)];

  const css=document.createElement('style');
  css.textContent=`
    /* Configurações do servidor: hierarquia mais próxima do Discord */
    #serverSettingsModal .modal-card{width:min(980px,96vw)!important}
    #serverSettingsModal .nf-server-columns{grid-template-columns:minmax(360px,.92fr) minmax(400px,1.08fr)!important;gap:18px!important}
    #serverSettingsModal .nf-server-section{padding:18px!important;border-radius:12px!important;background:#2b2d31!important}
    #serverSettingsModal .nf-server-identity{display:flex;flex-direction:column;gap:14px}
    #serverSettingsModal .nf-server-identity .field{order:1!important}
    #serverSettingsModal .nf-server-identity .server-icon-row{order:2!important}
    #serverSettingsModal .nf-server-identity #serverCoverPreview{order:3!important;height:150px!important;border-radius:8px!important}
    #serverSettingsModal .nf-server-identity #serverCoverInput{order:4!important}
    #serverSettingsModal .nf-server-identity .nf-cover-button{order:5!important}
    #serverSettingsModal .nf-server-identity .notice{order:6!important}
    #serverSettingsModal .server-icon-row{align-items:center!important;padding-top:4px!important}
    #serverSettingsModal .server-icon-row>div:last-child{display:flex;flex-direction:column;align-items:flex-start;gap:7px}

    /* Seletor de transmissão: mais limpo, menos cara de formulário */
    .nf-discord-share-shell{width:min(850px,94vw)!important}
    .nf-discord-share-shell .modal-body{padding:14px 16px!important}
    .nf-discord-share-shell .nf-discord-picker-head{margin-bottom:14px!important}
    .nf-discord-share-shell .nf-discord-picker-tab{font-size:14px!important}
    .nf-discord-share-shell .nf-discord-bottom{margin-top:16px!important;padding-top:14px!important}
    .nf-discord-share-shell [class*="source"] img,.nf-discord-share-shell [class*="capture"] img{object-fit:cover!important}

    /* Nunca alterar cor das imagens de usuário/servidor */
    img,.avatar,.msg-avatar,.profile-avatar-hd,.voice-avatar-xl,#profileAvatarPreview,#viewUserAvatar,#serverIconPreview,#serverCoverPreview{filter:none!important;-webkit-filter:none!important;mix-blend-mode:normal!important;opacity:1!important}
  `;
  document.head.appendChild(css);

  // ---------- IMAGENS ----------
  // Reimplementa o crop para os 4 destinos e reduz o peso sem perder qualidade visível.
  function exportCrop(type){
    if(!cropState?.img)return null;
    const {img}=cropState,z=cropState.z||1,x=cropState.x||0,y=cropState.y||0;
    const frame=cropFrame();
    const avatarLike=type==='avatar'||type==='serverIcon';
    const outW=avatarLike?768:1600;
    const outH=avatarLike?768:540;
    const base=Math.max(frame.w/img.width,frame.h/img.height)*z;
    const srcW=frame.w/base,srcH=frame.h/base;
    const sx=Math.max(0,Math.min(img.width-srcW,(img.width-srcW)/2-x/base));
    const sy=Math.max(0,Math.min(img.height-srcH,(img.height-srcH)/2-y/base));
    const c=document.createElement('canvas');c.width=outW;c.height=outH;
    const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,sx,sy,srcW,srcH,0,0,outW,outH);
    return c.toDataURL('image/jpeg',.92);
  }

  applyCrop=function(){
    if(!cropState)return;
    const type=cropState.type,data=exportCrop(type);if(!data)return;
    if(type==='avatar'){
      pendingAvatarData=data;
      if($('profileAvatarPreview'))$('profileAvatarPreview').src=data;
    }else if(type==='banner'){
      pendingBannerData=data;
      if($('profileBanner'))$('profileBanner').style.backgroundImage=`url(${data})`;
    }else if(type==='serverIcon'){
      window.pendingServerIcon=data;
      if($('serverIconPreview')){$('serverIconPreview').style.backgroundImage=`url(${data})`;$('serverIconPreview').textContent='';}
    }else if(type==='serverBanner'){
      pendingServerCover=data;
      if($('serverCoverPreview'))$('serverCoverPreview').style.backgroundImage=`url(${data})`;
    }
    try{cropState.input.value=''}catch{}
    cropState=null;closeModal('cropModal');
  };

  saveProfile=async function(){
    if(!currentUser)return;
    const patch={
      username:$('profileUsername')?.value?.trim()||currentUserData?.username||'Usuário',
      status:$('profileStatus')?.value?.trim()||'',
      bio:$('profileBio')?.value?.trim()||''
    };
    if(pendingAvatarData)patch.avatar=pendingAvatarData;
    if(pendingBannerData)patch.banner=pendingBannerData;
    try{
      await db.ref('users/'+currentUser.uid).update(patch);
      currentUserData={...(currentUserData||{}),...patch};
      if(patch.avatar&&voiceRoom)await db.ref(`voiceParticipants/${voiceRoom.channelId}/${currentUser.uid}/avatar`).set(patch.avatar).catch(()=>{});
      pendingAvatarData=null;pendingBannerData=null;
      if(typeof loadMyProfile==='function')await loadMyProfile();
      if($('meAvatar')&&patch.avatar)$('meAvatar').src=patch.avatar;
      qa(`[data-voice-user="${currentUser.uid}"] img`).forEach(i=>{if(patch.avatar)i.src=patch.avatar});
      if(voiceRoom){renderVoicePanel();refreshVoiceCallGrid();refreshVoiceSidebarParticipants();}
      closeModal('profileModal');toast('Perfil atualizado.');
    }catch(e){console.error(e);toast('Erro ao salvar perfil: '+(e.message||''));}
  };

  const baseOpenServerSettings=openServerSettings;
  function polishServerLayout(){
    const modal=$('serverSettingsModal');if(!modal)return;
    const identity=modal.querySelector('.nf-server-columns .nf-server-col:first-child .nf-server-section');
    if(identity){
      identity.classList.add('nf-server-identity');
      const name=$('serverEditName')?.closest('.field');if(name&&identity.firstElementChild!==name)identity.prepend(name);
      const coverInput=$('serverCoverInput');if(coverInput){const btn=coverInput.nextElementSibling;if(btn)btn.classList.add('nf-cover-button');}
    }
  }
  openServerSettings=async function(){await baseOpenServerSettings();setTimeout(polishServerLayout,60)};

  saveServerSettings=async function(){
    if(!currentServer)return;
    const patch={name:$('serverEditName')?.value?.trim()||'Servidor'};
    if(window.pendingServerIcon)patch.icon=window.pendingServerIcon;
    if(pendingServerCover)patch.cover=pendingServerCover;
    try{
      await db.ref('servers/'+currentServer).update(patch);
      window.pendingServerIcon=null;pendingServerCover=null;
      const sv=await db.ref('servers/'+currentServer).once('value');
      const data=sv.val()||patch;
      closeModal('serverSettingsModal');
      selectServer(currentServer,data);
      if(typeof loadServers==='function')loadServers();
      toast('Servidor atualizado.');
    }catch(e){console.error(e);toast('Erro ao salvar servidor: '+(e.message||''));}
  };

  // ---------- ÁUDIO DA CALL DURANTE TRANSMISSÃO ----------
  // Antes, quando a tela começava a compartilhar áudio, o mesmo <audio> remoto era
  // reapontado para o stream da tela. Isso substituía o stream do microfone e a voz sumia.
  // Agora voz e áudio da transmissão ficam em elementos separados.
  function ensureAudio(id){
    let a=$(id);if(!a){a=document.createElement('audio');a.id=id;a.autoplay=true;a.playsInline=true;a.style.display='none';document.body.appendChild(a)}
    a.muted=!!voiceDeafened;return a;
  }
  function attachRemoteTrackV312(uid,stream){
    if(!stream)return;
    const hasVideo=stream.getVideoTracks?.().length>0;
    const hasAudio=stream.getAudioTracks?.().length>0;
    if(hasVideo){
      remoteStreams[uid]=stream;
      if(hasAudio){const sa=ensureAudio('voiceScreenAudio-'+uid);sa.srcObject=new MediaStream(stream.getAudioTracks());sa.play().catch(()=>{});}
      const grid=$('voiceCallGrid');if(grid){
        let tile=$('voiceCallRemote-'+uid);
        if(!tile){tile=document.createElement('div');tile.className='voice-tile';tile.id='voiceCallRemote-'+uid;tile.innerHTML=`<button class="fullscreen-btn tooltip-btn" data-tip="Tela cheia" onclick="fullscreenTile('voiceCallRemote-${uid}')">⛶</button><video class="remote-stream-video" autoplay muted playsinline></video><div class="voice-tile-label">Transmissão</div>`;grid.prepend(tile)}
        const v=tile.querySelector('video');if(v){v.srcObject=new MediaStream(stream.getVideoTracks());v.muted=true;v.play().catch(()=>{});}
      }
    }else if(hasAudio){
      const a=ensureAudio('voiceAudio-'+uid);a.srcObject=new MediaStream(stream.getAudioTracks());a.play().catch(()=>{});
      startSpeakingDetection(uid,new MediaStream(stream.getAudioTracks()));
    }
  }

  const baseCreatePeer=createPeer;
  createPeer=async function(uid,initiator=false){
    const pc=await baseCreatePeer(uid,initiator);
    if(pc&&!pc.__nf312){pc.__nf312=true;pc.ontrack=e=>{
      const streams=e.streams?.length?e.streams:[new MediaStream([e.track])];
      streams.forEach(s=>attachRemoteTrackV312(uid,s));
    }}
    return pc;
  };

  const baseRemovePeer=removePeer;
  removePeer=function(uid){$('voiceScreenAudio-'+uid)?.remove();return baseRemovePeer(uid)};

  const baseSetIncomingAudioMuted=typeof setIncomingAudioMuted==='function'?setIncomingAudioMuted:null;
  setIncomingAudioMuted=function(muted){
    baseSetIncomingAudioMuted?.(muted);
    qa('audio[id^="voiceScreenAudio-"]').forEach(a=>a.muted=muted);
  };

  console.info('[Nuvem Fofa] v0.3.12 carregado');
})();
