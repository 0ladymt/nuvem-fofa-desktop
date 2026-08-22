// Nuvem Fofa v0.3.20 — corrige áudio durante transmissão, resumo ao vivo e menu de usuário
(() => {
  const $ = id => document.getElementById(id);
  const qa = (s,r=document)=>[...r.querySelectorAll(s)];
  const userVolumes = window.nfUserVolumes = window.nfUserVolumes || {};

  const css=document.createElement('style');
  css.textContent=`
    .nf-user-context{position:fixed;z-index:2147483000;width:252px;background:#111214;border:1px solid #2f3136;border-radius:8px;padding:7px;box-shadow:0 18px 48px #000b;color:#dbdee1;font-size:13px}
    .nf-user-context button{width:100%;border:0;background:transparent;color:#dbdee1;text-align:left;padding:8px 10px;border-radius:4px;cursor:pointer;font-weight:650}
    .nf-user-context button:hover{background:#5865f2;color:#fff}.nf-user-context button.danger{color:#f23f42}.nf-user-context button.danger:hover{background:#da373c;color:#fff}
    .nf-user-context .sep{height:1px;background:#3f4147;margin:5px 0}.nf-user-context .label{padding:7px 10px 4px;color:#b5bac1;font-size:12px;font-weight:700}
    .nf-user-context .vol{padding:4px 10px 8px}.nf-user-context input[type=range]{width:100%;accent-color:#5865f2}.nf-user-context .muted-note{font-size:11px;color:#949ba4;padding:0 10px 6px}
  `;
  document.head.appendChild(css);

  // ---------- TRANSMISSÃO: resumo deve acompanhar mudanças feitas depois de iniciar ----------
  function currentShare(){
    const m=window.nf319ShareMirror||{};
    let q=Number(m.quality||1080),fps=Number(m.fps||60);
    try{if(typeof sharePickerState!=='undefined'&&sharePickerState){q=Number(sharePickerState.quality||q);fps=Number(sharePickerState.fps||fps)}}catch{}
    return {q,fps};
  }
  function updateLiveShareLabels(){
    let active=false;try{active=!!localScreenStream}catch{}
    if(!active)return;
    const {q,fps}=currentShare();
    qa('#voiceCallLocalScreen .voice-tile-label').forEach(x=>x.textContent=`Sua tela · até ${q}p/${fps}fps`);
    qa('.voice-panel').forEach(p=>{const sub=p.querySelector('.voice-panel-sub');if(sub&&/tela|transmiss/i.test(p.textContent||'')){} });
    qa('body *').filter(el=>el.childNodes.length===1&&el.firstChild?.nodeType===3&&/^Sua tela · até \d+p\/\d+fps/.test(el.textContent||'')).forEach(el=>el.textContent=`Sua tela · até ${q}p/${fps}fps`);
  }
  const oldQ=window.chooseShareQuality;
  if(typeof oldQ==='function')window.chooseShareQuality=function(){const r=oldQ.apply(this,arguments);setTimeout(updateLiveShareLabels,0);setTimeout(updateLiveShareLabels,80);return r};
  const oldF=window.chooseShareFps;
  if(typeof oldF==='function')window.chooseShareFps=function(){const r=oldF.apply(this,arguments);setTimeout(updateLiveShareLabels,0);setTimeout(updateLiveShareLabels,80);return r};
  document.addEventListener('click',e=>{if(e.target.closest?.('.nf318-choice[data-q],.nf318-choice[data-fps]'))setTimeout(updateLiveShareLabels,50)},true);

  // ---------- BARRA DO USUÁRIO: restaura dados reais, inclusive avatar ----------
  function restoreSelfBar(){
    const bar=$('meUserbar'); if(!bar)return;
    try{
      const d=typeof currentUserData!=='undefined'?currentUserData:null;
      if(!d)return;
      const av=$('meAvatar'),nm=$('meName'),st=$('meStatus');
      if(av){const src=typeof imgFor==='function'?imgFor(d):(d.avatar||'');if(src)av.src=src;}
      if(nm)nm.textContent=d.username||'Usuário';
      if(st)st.textContent=(typeof presenceLabel==='function'?presenceLabel(d.presenceMode||'online'):(d.status||'Disponível'))||'Disponível';
    }catch(e){console.warn('[v0.3.20] self bar',e)}
  }
  const oldLeave=window.leaveVoiceChannel;
  if(typeof oldLeave==='function')window.leaveVoiceChannel=async function(){const r=await oldLeave.apply(this,arguments);setTimeout(restoreSelfBar,0);setTimeout(restoreSelfBar,150);setTimeout(restoreSelfBar,500);return r};

  // ---------- ÁUDIO REMOTO: microfone nunca pode ser substituído pelo áudio da tela ----------
  function ensureAudio(id){let a=$(id);if(!a){a=document.createElement('audio');a.id=id;a.autoplay=true;a.playsInline=true;a.style.display='none';document.body.appendChild(a)}return a}
  function applyUserVolume(uid){
    const vol=Number(localStorage.getItem('nfUserVolume:'+uid)??userVolumes[uid]??1);userVolumes[uid]=vol;
    const muted=localStorage.getItem('nfUserMuted:'+uid)==='1';
    ['voiceAudio-','voiceScreenAudio-'].forEach(pre=>{const a=$(pre+uid);if(a){a.volume=Math.max(0,Math.min(2,vol));a.muted=!!muted || !!(typeof voiceDeafened!=='undefined'&&voiceDeafened)}});
  }
  function attachRemoteSafe(uid,stream){
    if(!stream)return;
    const videos=stream.getVideoTracks?.()||[],audios=stream.getAudioTracks?.()||[];
    if(videos.length){
      try{remoteStreams[uid]=stream}catch{}
      if(audios.length){const a=ensureAudio('voiceScreenAudio-'+uid);a.srcObject=new MediaStream(audios);applyUserVolume(uid);a.play().catch(()=>{})}
      const grid=$('voiceCallGrid');if(grid){let tile=$('voiceCallRemote-'+uid);if(!tile){tile=document.createElement('div');tile.className='voice-tile';tile.id='voiceCallRemote-'+uid;tile.innerHTML=`<button class="fullscreen-btn tooltip-btn" data-tip="Tela cheia" onclick="fullscreenTile('voiceCallRemote-${uid}')">⛶</button><video class="remote-stream-video" autoplay muted playsinline></video><div class="voice-tile-label">Transmissão</div>`;grid.prepend(tile)}const v=tile.querySelector('video');if(v){v.srcObject=new MediaStream(videos);v.muted=true;v.play().catch(()=>{})}}
    }else if(audios.length){
      const a=ensureAudio('voiceAudio-'+uid);a.srcObject=new MediaStream(audios);applyUserVolume(uid);a.play().catch(()=>{});
      try{startSpeakingDetection(uid,new MediaStream(audios))}catch{}
    }
  }
  const oldCreate=window.createPeer;
  if(typeof oldCreate==='function')window.createPeer=async function(uid,initiator=false){const pc=await oldCreate.apply(this,arguments);if(pc&&!pc.__nf320){pc.__nf320=true;pc.ontrack=e=>{const streams=e.streams?.length?e.streams:[new MediaStream([e.track])];streams.forEach(s=>attachRemoteSafe(uid,s))}}return pc};

  // ---------- MENU DE CONTEXTO DOS PARTICIPANTES ----------
  let menu=null,menuUid=null;
  function closeMenu(){menu?.remove();menu=null;menuUid=null}
  async function isServerOwner(){try{if(!currentServer||!currentUser)return false;const s=await db.ref('servers/'+currentServer+'/createdBy').once('value');return s.val()===currentUser.uid}catch{return false}}
  async function setServerModeration(uid,key,val){if(!voiceRoom)return;await db.ref(`voiceModeration/${voiceRoom.channelId}/${uid}/${key}`).set(val);}
  async function openCtx(uid,x,y){
    if(!uid||!currentUser||uid===currentUser.uid)return;
    closeMenu();menuUid=uid;
    const us=await db.ref('users/'+uid).once('value'),u=us.val()||{};const owner=await isServerOwner();
    let vol=Number(localStorage.getItem('nfUserVolume:'+uid)??1);let muted=localStorage.getItem('nfUserMuted:'+uid)==='1';
    menu=document.createElement('div');menu.className='nf-user-context';menu.style.left=Math.min(x,innerWidth-270)+'px';menu.style.top=Math.min(y,innerHeight-560)+'px';
    menu.innerHTML=`
      <button data-a="profile">Perfil</button><button data-a="message">Mensagem</button>
      <div class="sep"></div><div class="label">Volume do usuário</div><div class="vol"><input data-a="volume" type="range" min="0" max="2" step="0.01" value="${vol}"></div>
      <button data-a="mute">${muted?'Ativar som':'Silenciar'}</button><button data-a="nickname">Alterar apelido</button><button data-a="unfriend">Desfazer amizade</button>
      <div class="sep"></div>
      <button data-a="servermute" ${owner?'':'disabled'}>Silenciar voz no servidor</button><button data-a="serverdeafen" ${owner?'':'disabled'}>Desativar áudio no servidor</button><button class="danger" data-a="disconnect" ${owner?'':'disabled'}>Desconectar</button>`;
    document.body.appendChild(menu);
    menu.querySelector('[data-a="volume"]').oninput=e=>{vol=Number(e.target.value);localStorage.setItem('nfUserVolume:'+uid,String(vol));applyUserVolume(uid)};
    menu.onclick=async e=>{const b=e.target.closest('button[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;
      if(a==='profile'){closeMenu();openUserProfile(uid)}
      else if(a==='message'){closeMenu();openDM(uid)}
      else if(a==='mute'){muted=!muted;localStorage.setItem('nfUserMuted:'+uid,muted?'1':'0');applyUserVolume(uid);b.textContent=muted?'Ativar som':'Silenciar'}
      else if(a==='nickname'){const name=prompt('Apelido para este usuário:',localStorage.getItem('nfUserNick:'+uid)||u.username||'');if(name!==null){localStorage.setItem('nfUserNick:'+uid,name.trim());toast('Apelido salvo neste dispositivo.')}closeMenu()}
      else if(a==='unfriend'){closeMenu();removeFriend(uid)}
      else if(a==='servermute'){await setServerModeration(uid,'muted',true);toast('Voz do usuário silenciada no servidor.');closeMenu()}
      else if(a==='serverdeafen'){await setServerModeration(uid,'deafened',true);toast('Áudio do usuário desativado no servidor.');closeMenu()}
      else if(a==='disconnect'){await setServerModeration(uid,'disconnectAt',Date.now());toast('Usuário desconectado da call.');closeMenu()}
    };
  }
  document.addEventListener('contextmenu',e=>{const t=e.target.closest?.('[data-voice-user]');if(!t)return;const uid=t.dataset.voiceUser;if(!uid||uid===currentUser?.uid)return;e.preventDefault();e.stopPropagation();openCtx(uid,e.clientX,e.clientY)},true);
  document.addEventListener('click',e=>{if(menu&&!e.target.closest('.nf-user-context'))closeMenu()},true);
  window.addEventListener('blur',closeMenu);

  // Faz os comandos de moderação serem obedecidos no cliente-alvo.
  let modRef=null,lastRoom=null;
  function bindModeration(){
    try{
      if(!voiceRoom||!currentUser){modRef?.off();modRef=null;lastRoom=null;return}
      if(lastRoom===voiceRoom.channelId)return;
      modRef?.off();lastRoom=voiceRoom.channelId;modRef=db.ref(`voiceModeration/${voiceRoom.channelId}/${currentUser.uid}`);
      modRef.on('value',s=>{const d=s.val()||{};
        if(d.muted&&localVoiceStream){localVoiceStream.getAudioTracks().forEach(t=>t.enabled=false);voiceMuted=true;updateVoiceCallControls?.();renderVoicePanel?.()}
        if(d.deafened){qa('audio[id^="voiceAudio-"],audio[id^="voiceScreenAudio-"]').forEach(a=>a.muted=true)}
        if(d.disconnectAt&&Date.now()-Number(d.disconnectAt)<10000)leaveVoiceChannel?.();
      });
    }catch{}
  }
  setInterval(bindModeration,1000);

  console.info('[Nuvem Fofa] v0.3.20 áudio da call, volume e menu de usuário carregados');
})();
