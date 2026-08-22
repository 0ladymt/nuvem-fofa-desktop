// Nuvem Fofa v0.3.3 — correções da rodada de vídeo
(() => {
  const $ = (id) => document.getElementById(id);
  const qsa = (s, r=document) => [...r.querySelectorAll(s)];
  const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

  const css = document.createElement('style');
  css.textContent = `
    /* chamada e compartilhamento */
    .voice-panel-user,#voicePanel .userbar,.voice-panel .userbar{display:none!important}
    .nf-native-fullscreen{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;z-index:2147483000!important;background:#000!important;border-radius:0!important;margin:0!important;padding:0!important}
    .nf-native-fullscreen video{width:100%!important;height:100%!important;object-fit:contain!important;background:#000!important}
    .fullscreen-btn,.nf-fullscreen-btn{opacity:1!important;visibility:visible!important;display:grid!important}
    .voice-user.speaking .avatar,.member.speaking .avatar,.userbar.speaking .avatar{outline:3px solid #23a559!important;outline-offset:2px}
    .nf-stream-volume{display:flex;align-items:center;gap:8px;padding:7px 10px;background:#111214;border-radius:8px;margin-top:6px}
    .nf-stream-volume input{width:130px;accent-color:#5865f2}

    /* convites */
    .nf-invite-link{color:#00a8fc!important;text-decoration:none!important;cursor:pointer!important;word-break:break-all}
    .nf-invite-link:hover{text-decoration:underline!important}
    .nf-invite-card{margin-top:8px;width:min(430px,100%);background:#2b2d31;border:1px solid #3f4147;border-radius:8px;padding:12px;display:grid;grid-template-columns:46px 1fr auto;gap:10px;align-items:center}
    .nf-invite-cloud{width:46px;height:46px;border-radius:14px;background:#5865f2;display:grid;place-items:center}
    .nf-invite-cloud svg{width:27px;height:27px;fill:white}
    .nf-invite-card b{display:block;margin-bottom:3px}.nf-invite-card small{color:#b5bac1}.nf-invite-card button{border:0;background:#248046;color:#fff;font-weight:700;border-radius:4px;padding:9px 12px;cursor:pointer}

    /* perfil e mídia */
    #mediaViewerBody img,.media-viewer-body img,.nf-media-viewer img{filter:none!important;mix-blend-mode:normal!important;opacity:1!important;image-rendering:auto!important}
    .msg-avatar,.member .avatar,.voice-user .avatar,.userbar .avatar{image-rendering:auto!important}
    .nf-media-viewer{position:fixed;inset:0;z-index:2147482000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:24px}
    .nf-media-viewer img,.nf-media-viewer video{max-width:94vw;max-height:90vh;object-fit:contain;filter:none!important}
    .nf-media-viewer-close{position:fixed;top:18px;right:22px;width:42px;height:42px;border-radius:50%;border:0;background:#2b2d31;color:#fff;font-size:26px;cursor:pointer}

    /* servidor */
    .nf-server-icon-editor{display:grid;grid-template-columns:74px 1fr;gap:12px;align-items:center;margin:12px 0;padding:12px;background:#2b2d31;border:1px solid #3f4147;border-radius:8px}
    .nf-server-icon-preview{width:74px;height:74px;border-radius:20px;background:#1e1f22 center/cover no-repeat;border:1px solid #4e5058;display:grid;place-items:center;overflow:hidden}
    .nf-server-icon-editor button{margin-top:8px}

    /* seletor de transmissão */
    .nf-share-quality{margin:12px 0;padding:12px;background:#2b2d31;border:1px solid #3f4147;border-radius:8px}
    .nf-share-quality-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}
    .nf-share-quality button{border:1px solid #4e5058;background:#1e1f22;color:#dbdee1;padding:9px;border-radius:6px;cursor:pointer}
    .nf-share-quality button.active{background:#5865f2;border-color:#5865f2;color:#fff}
  `;
  document.head.appendChild(css);

  // ---------- mídia: abrir maior e preservar cor ----------
  function openMedia(src, type='image'){
    if(!src) return;
    const old=$('nfMediaViewer'); if(old) old.remove();
    const wrap=document.createElement('div');wrap.id='nfMediaViewer';wrap.className='nf-media-viewer';
    const close=document.createElement('button');close.className='nf-media-viewer-close';close.textContent='×';close.title='Fechar';close.onclick=()=>wrap.remove();
    let el;
    if(type==='video'){ el=document.createElement('video');el.src=src;el.controls=true;el.autoplay=true; }
    else { el=document.createElement('img');el.src=src;el.alt='Imagem ampliada'; }
    el.addEventListener('contextmenu',()=>{});
    wrap.append(el,close);wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove()});document.body.appendChild(wrap);
  }
  document.addEventListener('click',e=>{
    const img=e.target.closest?.('.attachment img,.msg img,.profile-banner img,.msg-avatar,.member .avatar,.voice-user .avatar');
    if(img?.src){e.preventDefault();openMedia(img.src,'image');return;}
    const v=e.target.closest?.('.attachment video,.msg video');if(v?.src){e.preventDefault();openMedia(v.src,'video');}
  },true);

  // ---------- fullscreen real no Electron ----------
  window.fullscreenTile = async function(id){
    const el=$(id);if(!el)return;
    const active=el.classList.contains('nf-native-fullscreen');
    qsa('.nf-native-fullscreen').forEach(x=>x.classList.remove('nf-native-fullscreen'));
    if(active){ try{await window.nuvemDesktop?.setFullscreen?.(false)}catch{}; return; }
    el.classList.add('nf-native-fullscreen');
    try{await window.nuvemDesktop?.setFullscreen?.(true)}catch{}
    try{await el.requestFullscreen?.()}catch{}
  };
  async function exitFullscreen(){qsa('.nf-native-fullscreen').forEach(x=>x.classList.remove('nf-native-fullscreen'));try{await window.nuvemDesktop?.setFullscreen?.(false)}catch{}}
  document.addEventListener('keydown',e=>{if(e.key==='Escape')exitFullscreen()});
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)qsa('.nf-native-fullscreen').forEach(x=>x.classList.remove('nf-native-fullscreen'))});

  // ---------- perfil duplicado na barra inferior ----------
  function cleanupDuplicatedProfile(){
    qsa('#voicePanel .voice-panel-user,#voicePanel .userbar,.voice-panel .voice-panel-user,.voice-panel .userbar').forEach(x=>x.remove());
    const bars=qsa('.sidebar .userbar');
    if(bars.length>1) bars.slice(0,-1).forEach(x=>{ if(x.closest('#voicePanel,.voice-panel')) x.remove(); });
  }

  // ---------- ícone/foto do servidor: controle próprio que salva de verdade ----------
  let pendingServerIcon033=null;
  function fileToDataURL(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
  async function makeServerIcon(file){
    const original=await fileToDataURL(file);
    const img=new Image();img.src=original;await img.decode();
    const size=1024,c=document.createElement('canvas');c.width=size;c.height=size;const ctx=c.getContext('2d',{colorSpace:'srgb'});
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const scale=Math.max(size/img.width,size/img.height),w=img.width*scale,h=img.height*scale;
    ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
    return c.toDataURL('image/png',1);
  }
  async function injectServerIconEditor(){
    const modal=$('serverSettingsModal');if(!modal?.classList.contains('active')||$('nfServerIconEditor'))return;
    let data={};try{if(window.currentServer&&window.db)data=(await db.ref('servers/'+currentServer).once('value')).val()||{}}catch{}
    const anchor=$('serverEditName')?.closest('.field')||modal.querySelector('.modal-body');if(!anchor)return;
    const box=document.createElement('div');box.id='nfServerIconEditor';box.className='nf-server-icon-editor';
    const prev=document.createElement('div');prev.className='nf-server-icon-preview';prev.id='nfServerIconPreview';if(data.icon)prev.style.backgroundImage=`url("${data.icon}")`;
    const right=document.createElement('div');right.innerHTML='<b>Foto do servidor</b><div class="muted tiny">PNG/JPG até 20 MB. A imagem será salva em alta qualidade.</div>';
    const inp=document.createElement('input');inp.type='file';inp.accept='image/png,image/jpeg,image/webp';inp.hidden=true;
    const btn=document.createElement('button');btn.className='secondary';btn.textContent=data.icon?'Alterar foto':'Adicionar foto';btn.onclick=()=>inp.click();
    inp.onchange=async()=>{const f=inp.files?.[0];if(!f)return;if(f.size>20*1024*1024)return window.toast?.('A foto do servidor pode ter até 20 MB.');pendingServerIcon033=await makeServerIcon(f);prev.style.backgroundImage=`url("${pendingServerIcon033}")`;btn.textContent='Alterar foto';};
    right.append(btn,inp);box.append(prev,right);anchor.insertAdjacentElement('afterend',box);
  }
  const oldOpenServer=window.openServerSettings;
  if(typeof oldOpenServer==='function') window.openServerSettings=async(...a)=>{await oldOpenServer(...a);await sleep(20);pendingServerIcon033=null;injectServerIconEditor()};
  const oldSaveServer=window.saveServerSettings;
  window.saveServerSettings=async function(){
    if(!window.currentServer||!window.db)return oldSaveServer?.();
    const patch={name:$('serverEditName')?.value?.trim()||'Servidor'};
    try{if(window.pendingServerCover)patch.cover=window.pendingServerCover}catch{}
    if(pendingServerIcon033)patch.icon=pendingServerIcon033;
    try{await db.ref('servers/'+currentServer).update(patch);window.closeModal?.('serverSettingsModal');window.toast?.('Servidor atualizado.');const s=await db.ref('servers/'+currentServer).once('value');window.selectServer?.(currentServer,s.val()||patch)}catch(e){window.toast?.('Não foi possível salvar o servidor.')}
  };

  // ---------- convites: clicáveis no desktop e card bonito ----------
  const inviteRegex=/(https?:\/\/nuvemfofa\.netlify\.app\/?\?invite=([A-Za-z0-9_-]+))/i;
  async function openInvite(code){
    try{
      const s=await db.ref('serverInvites/'+code).once('value');if(!s.exists())return window.toast?.('Convite inválido ou expirado.');
      const inv=s.val(),sv=await db.ref('servers/'+inv.serverId).once('value');if(!sv.exists())return window.toast?.('Servidor não existe mais.');
      const server=sv.val()||{};if(server.createdBy===currentUser.uid||server.members?.[currentUser.uid])return window.toast?.('Você já participa deste servidor.');
      window.pendingInvite={code,...inv,server};if($('inviteJoinText'))$('inviteJoinText').innerHTML=`Você foi convidada para <b>${server.name||'Servidor'}</b>.`;window.openModal?.('inviteJoinModal');
    }catch{window.toast?.('Não foi possível abrir o convite.')}
  }
  function upgradeInviteMessages(){
    qsa('.msg-text,.dm-message-text,.message-content,[data-message-text]').forEach(el=>{
      if(el.dataset.nfInvite033==='1')return;const txt=el.textContent||'',m=txt.match(inviteRegex);if(!m)return;
      const url=m[1],code=m[2];el.dataset.nfInvite033='1';
      const a=document.createElement('a');a.href=url;a.textContent=url;a.className='nf-invite-link';a.onclick=e=>{e.preventDefault();openInvite(code)};
      el.textContent='';el.append(a);
      const card=document.createElement('div');card.className='nf-invite-card';
      card.innerHTML=`<div class="nf-invite-cloud"><svg viewBox="0 0 64 64"><path d="M20 43h26a10 10 0 0 0 1-20 15 15 0 0 0-28-4 12 12 0 0 0 1 24Z"/></svg></div><div><b>Convite para servidor</b><small>Abrir este convite no Nuvem Fofa</small></div>`;
      const b=document.createElement('button');b.textContent='Entrar';b.onclick=()=>openInvite(code);card.appendChild(b);el.appendChild(card);
    });
  }
  const oldInvite=window.createServerInvite;
  if(typeof oldInvite==='function') window.createServerInvite=async(...a)=>{await oldInvite(...a);const input=$('inviteLink');if(input?.value){const m=input.value.match(/[?&]invite=([\w-]+)/);if(m)input.value=`https://nuvemfofa.netlify.app/?invite=${m[1]}`;try{await window.nuvemDesktop?.copyText?.(input.value)}catch{}}};

  // ---------- transmissão: opções claras de qualidade + volume ----------
  window.nfShareSettings=window.nfShareSettings||{width:1920,height:1080,fps:60};
  function injectShareQuality(){
    const modal=qsa('.modal.active').find(m=>/compartilh|transmiss|tela/i.test(m.textContent||''));if(!modal||modal.querySelector('#nfShareQuality'))return;
    const body=modal.querySelector('.modal-body')||modal.querySelector('.modal-card')||modal;
    const box=document.createElement('div');box.id='nfShareQuality';box.className='nf-share-quality';box.innerHTML='<b>Qualidade da transmissão</b><div class="muted tiny">Escolha antes de iniciar. Full HD é 1920×1080.</div><div class="nf-share-quality-grid"></div>';
    const grid=box.querySelector('.nf-share-quality-grid');
    const presets=[['720p · 30 FPS',1280,720,30],['1080p · 30 FPS',1920,1080,30],['1080p · 60 FPS',1920,1080,60]];
    presets.forEach(([label,w,h,f])=>{const b=document.createElement('button');b.textContent=label;if(w===window.nfShareSettings.width&&f===window.nfShareSettings.fps)b.classList.add('active');b.onclick=()=>{window.nfShareSettings={width:w,height:h,fps:f};qsa('button',grid).forEach(x=>x.classList.remove('active'));b.classList.add('active')};grid.appendChild(b)});
    body.appendChild(box);
  }
  function applyShareConstraints(){
    const v=qsa('.voice-tile video,video').find(v=>v.srcObject&&v.srcObject.getVideoTracks?.().length);if(!v)return;
    const track=v.srcObject.getVideoTracks()[0];const s=window.nfShareSettings;track?.applyConstraints?.({width:{ideal:s.width,max:s.width},height:{ideal:s.height,max:s.height},frameRate:{ideal:s.fps,max:s.fps}}).catch(()=>{});
  }
  function addVolumeControls(){
    qsa('.voice-tile').forEach(tile=>{
      const video=tile.querySelector('video');if(!video||tile.querySelector('.nf-stream-volume'))return;
      if(video.muted)return;
      const row=document.createElement('div');row.className='nf-stream-volume';row.innerHTML='<span>Volume</span>';
      const range=document.createElement('input');range.type='range';range.min='0';range.max='100';range.value=Math.round((video.volume??1)*100);range.oninput=()=>{video.volume=Number(range.value)/100};row.append(range);tile.append(row);
    });
  }

  // ---------- supressão de ruído e eco: reforce constraints de áudio ----------
  async function improveMic(){
    try{
      const streams=qsa('audio,video').map(x=>x.srcObject).filter(Boolean);
      streams.forEach(s=>s.getAudioTracks?.().forEach(t=>t.applyConstraints?.({echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}).catch(()=>{})));
    }catch{}
  }

  // ---------- borda verde também na miniatura inferior/lateral ----------
  function syncSpeakingUI(){
    const speaking=qsa('.voice-tile.speaking,.voice-tile[style*="23a559"],.voice-tile[style*="green"]');
    const names=new Set(speaking.map(x=>x.textContent?.trim()).filter(Boolean));
    qsa('.voice-user,.member,.userbar').forEach(el=>{const hit=[...names].some(n=>n&&el.textContent?.includes(n));el.classList.toggle('speaking',hit)});
  }

  // ---------- presença na call: limpar fantasma após sair ----------
  const oldLeave=window.leaveVoiceChannel||window.leaveCall||window.disconnectVoice;
  if(typeof oldLeave==='function'){
    const wrapped=async(...a)=>{const r=await oldLeave(...a);try{if(window.currentUser&&window.db&&window.currentVoiceChannel){await db.ref(`voicePresence/${currentVoiceChannel}/${currentUser.uid}`).remove()}}catch{};return r};
    if(window.leaveVoiceChannel)window.leaveVoiceChannel=wrapped;else if(window.leaveCall)window.leaveCall=wrapped;else window.disconnectVoice=wrapped;
  }

  // ---------- observador geral ----------
  const observer=new MutationObserver(()=>{
    cleanupDuplicatedProfile();upgradeInviteMessages();injectServerIconEditor();injectShareQuality();addVolumeControls();syncSpeakingUI();applyShareConstraints();improveMic();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  setInterval(()=>{cleanupDuplicatedProfile();upgradeInviteMessages();addVolumeControls();syncSpeakingUI();improveMic()},1800);
  cleanupDuplicatedProfile();upgradeInviteMessages();
})();
