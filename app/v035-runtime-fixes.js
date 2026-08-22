// Nuvem Fofa v0.3.5 — correções que atuam no estado real do app
(() => {
  const $ = id => document.getElementById(id);
  const qsa = (s,r=document) => [...r.querySelectorAll(s)];

  const css = document.createElement('style');
  css.textContent = `
    .nf-app-version{position:fixed;right:8px;bottom:5px;z-index:2147480000;font:10px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;color:#949ba4;opacity:.72;pointer-events:none}
    #serverSettingsModal .modal-card{width:min(980px,96vw)!important;max-height:88vh!important;overflow:hidden!important}
    #serverSettingsModal .modal-body{max-height:calc(88vh - 120px)!important;overflow:auto!important;padding:22px!important;display:grid!important;grid-template-columns:minmax(300px,.95fr) minmax(360px,1.05fr)!important;gap:18px 24px!important;align-items:start!important}
    #serverSettingsModal .server-icon-row,#serverSettingsModal #serverCoverPreview,#serverSettingsModal .field{grid-column:1!important}
    #serverSettingsModal h3,#serverSettingsModal h3+p,#serverSettingsModal h3+p+button,#serverSettingsModal #inviteBox,#serverSettingsModal .server-members-card,#serverSettingsModal .leave-server-section{grid-column:2!important}
    #serverSettingsModal hr{display:none!important}
    #nfServerIconEditor{display:none!important}
    @media(max-width:800px){#serverSettingsModal .modal-body{display:block!important}}

    img,.avatar,.msg-avatar,.profile-avatar-hd,.voice-avatar-xl,#profileAvatarPreview,#viewUserAvatar,#serverIconPreview,.media-viewer-body img{filter:none!important;-webkit-filter:none!important;mix-blend-mode:normal!important;opacity:1!important;color-scheme:normal!important}

    .nf-stream-overlay{position:fixed;inset:0;background:#000;z-index:2147483000;display:none;align-items:center;justify-content:center}
    .nf-stream-overlay.show{display:flex}
    .nf-stream-overlay video{width:100%;height:100%;object-fit:contain;background:#000}
    .nf-stream-overlay-close{position:absolute;right:18px;top:18px;width:44px;height:44px;border:0;border-radius:10px;background:#202225e8;color:white;display:grid;place-items:center;cursor:pointer;z-index:2}
    .nf-stream-overlay-label{position:absolute;left:18px;bottom:18px;background:#111c;color:#fff;padding:8px 10px;border-radius:8px;font-size:12px}

    .nf-share-active{background:#248046!important;color:#fff!important}
    .nf-share-group{display:inline-flex;align-items:stretch;position:relative}
    .nf-share-group>#callShareBtn{border-radius:999px 0 0 999px!important}
    .nf-share-arrow{width:30px;border:0;border-left:1px solid #ffffff30;border-radius:0 999px 999px 0;background:#248046;color:#fff;cursor:pointer;display:grid;place-items:center;padding:0}
    .nf-share-menu{position:fixed;z-index:2147482500;width:290px;background:#232428;border:1px solid #3f4147;border-radius:10px;box-shadow:0 18px 55px #000a;padding:8px;display:none;color:#f2f3f5}
    .nf-share-menu.show{display:block}
    .nf-share-menu button{width:100%;border:0;background:transparent;color:inherit;text-align:left;padding:9px 10px;border-radius:7px;cursor:pointer}
    .nf-share-menu button:hover{background:#35373c}
    .nf-share-menu .sep{height:1px;background:#3f4147;margin:6px 2px}
    .nf-share-menu .title{font-size:10px;text-transform:uppercase;color:#949ba4;font-weight:800;padding:6px 10px 4px}
    .nf-share-menu .choices{display:grid;grid-template-columns:1fr 1fr;gap:5px}
    .nf-share-menu .choices button{background:#1e1f22;text-align:center}
    .nf-share-menu .choices button.active{background:#5865f2;color:#fff}
  `;
  document.head.appendChild(css);

  function ensureVersion(){
    let e=$('nfAppVersion');
    if(!e){e=document.createElement('div');e.id='nfAppVersion';e.className='nf-app-version';document.body.appendChild(e)}
    e.textContent='v'+(window.nuvemDesktop?.version||'0.3.5');
  }

  // Fecha modais clicando na área escura, sem interferir nos controles internos.
  document.addEventListener('mousedown',e=>{
    const m=e.target;
    if(!(m instanceof HTMLElement) || !m.classList.contains('modal') || !m.classList.contains('active')) return;
    if(['serverSettingsModal','userProfileModal','profileModal','settingsModal','sharePickerModal','inviteJoinModal'].includes(m.id)) closeModal(m.id);
  },true);

  // Fullscreen estável: não usa Fullscreen API do Chromium/Electron, que estava deixando a tela verde.
  function ensureStreamOverlay(){
    let o=$('nfStableStreamOverlay');
    if(o)return o;
    o=document.createElement('div');o.id='nfStableStreamOverlay';o.className='nf-stream-overlay';
    o.innerHTML=`<button class="nf-stream-overlay-close" title="Sair da tela cheia"><svg viewBox="0 0 48 48" style="width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:4"><path d="M18 6H6v12M30 6h12v12M6 30v12h12M42 30v12H30"/></svg></button><video autoplay playsinline></video><div class="nf-stream-overlay-label">Transmissão em tela cheia · Esc para sair</div>`;
    document.body.appendChild(o);
    o.querySelector('.nf-stream-overlay-close').onclick=closeStableFullscreen;
    return o;
  }
  function closeStableFullscreen(){const o=$('nfStableStreamOverlay');if(!o)return;const v=o.querySelector('video');v.pause();v.srcObject=null;o.classList.remove('show')}
  fullscreenTile=function(id){
    const tile=$(id),srcVideo=tile?.querySelector('video');
    if(!srcVideo?.srcObject)return toast('Esta área não possui uma transmissão.');
    const o=ensureStreamOverlay(),v=o.querySelector('video');
    v.srcObject=srcVideo.srcObject;v.muted=srcVideo.muted;
    o.classList.add('show');v.play().catch(()=>{});
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('nfStableStreamOverlay')?.classList.contains('show')){e.preventDefault();closeStableFullscreen()}},true);

  // Crop em PNG e usando as variáveis reais do index.html, preservando melhor a cor original.
  applyCrop=function(){
    if(!cropState)return;
    const st=cropState,{img,type}=st,z=st.z||1,x=st.x||0,y=st.y||0;
    const stage=$('cropStage');
    const square=type==='avatar'||type==='serverIcon';
    const frame=square?{w:250,h:250}:{w:Math.min(560,stage.clientWidth*.88),h:190};
    const outW=square?1024:1600,outH=square?1024:540;
    const base=Math.max(frame.w/img.width,frame.h/img.height)*z;
    const dispW=img.width*base,dispH=img.height*base;
    const sx=outW/frame.w,sy=outH/frame.h;
    const c=document.createElement('canvas');c.width=outW;c.height=outH;
    const ctx=c.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.fillStyle='#000';ctx.fillRect(0,0,outW,outH);
    ctx.drawImage(img,(outW-dispW*sx)/2+x*sx,(outH-dispH*sy)/2+y*sy,dispW*sx,dispH*sy);
    const data=c.toDataURL('image/png');
    if(type==='avatar'){pendingAvatarData=data;if($('profileAvatarPreview'))$('profileAvatarPreview').src=data}
    else if(type==='serverIcon'){pendingServerIcon=data;const p=$('serverIconPreview');if(p){p.style.backgroundImage=`url("${data}")`;p.textContent=''}}
    else if(type==='serverBanner'){pendingServerCover=data;if($('serverCoverPreview'))$('serverCoverPreview').style.backgroundImage=`url("${data}")`}
    else{pendingBannerData=data;if($('profileBanner'))$('profileBanner').style.backgroundImage=`url("${data}")`}
    if(st.input)st.input.value='';cropState=null;closeModal('cropModal');
  };

  // Configurações do servidor: uma única foto e salvamento real no Firebase.
  const openServerBase=openServerSettings;
  openServerSettings=async function(){
    await openServerBase();
    setTimeout(async()=>{
      $('nfServerIconEditor')?.remove();
      const modal=$('serverSettingsModal');
      if(!modal)return;
      qsa('[data-duplicate-server-icon],.server-icon-duplicate',modal).forEach(x=>x.remove());
      try{const snap=await db.ref('servers/'+currentServer).once('value'),d=snap.val()||{};const p=$('serverIconPreview');if(p){p.style.backgroundImage=d.icon?`url("${d.icon}")`:'';p.textContent=d.icon?'':(d.name||'S').split(/\s+/).map(x=>x[0]).join('').slice(0,3).toUpperCase()}}catch{}
    },20);
  };
  saveServerSettings=async function(){
    if(!currentServer)return;
    const patch={name:$('serverEditName')?.value?.trim()||'Servidor'};
    if(pendingServerIcon)patch.icon=pendingServerIcon;
    if(pendingServerCover)patch.cover=pendingServerCover;
    try{
      await db.ref('servers/'+currentServer).update(patch);
      const snap=await db.ref('servers/'+currentServer).once('value');
      const data=snap.val()||patch;
      pendingServerIcon=null;pendingServerCover=null;
      closeModal('serverSettingsModal');selectServer(currentServer,data);loadServers();toast('Servidor atualizado.');
    }catch(e){toast('Não foi possível salvar o servidor: '+(e.message||''))}
  };

  // Convites: quem já é membro vai direto ao servidor.
  async function openInviteDirect(code){
    try{
      const s=await db.ref('serverInvites/'+code).once('value');if(!s.exists())return toast('Convite inválido ou expirado.');
      const inv=s.val(),sv=await db.ref('servers/'+inv.serverId).once('value');if(!sv.exists())return toast('Servidor não existe mais.');
      const server=sv.val()||{};
      if(server.createdBy===currentUser.uid||server.members?.[currentUser.uid]){closeModal('inviteJoinModal');selectServer(inv.serverId,server);return}
      pendingInvite={code,...inv,server};if($('inviteJoinText'))$('inviteJoinText').innerHTML=`Você foi convidada para <b>${server.name||'Servidor'}</b>.`;openModal('inviteJoinModal');
    }catch(e){toast('Não foi possível abrir este convite.')}
  }
  document.addEventListener('click',e=>{
    const link=e.target.closest?.('a[href*="invite="]');
    if(link){try{const u=new URL(link.href);const code=u.searchParams.get('invite');if(code){e.preventDefault();openInviteDirect(code)}}catch{}return}
    const btn=e.target.closest?.('.nf-invite-card button');
    if(btn){const host=btn.closest('.msg-text,.dm-message-text,.message-content,[data-message-text]')||btn.parentElement?.parentElement;const a=host?.querySelector('a[href*="invite="]');if(a){try{const code=new URL(a.href).searchParams.get('invite');if(code){e.preventDefault();openInviteDirect(code)}}catch{}}}
  },true);

  // Menu de transmissão igual ao comportamento pedido: ativo em verde + seta ao lado.
  window.nfShareSettings=window.nfShareSettings||{height:1080,width:1920,fps:60};
  function applyShareSettings(){
    const tr=localScreenStream?.getVideoTracks?.()[0];if(!tr)return;
    const s=window.nfShareSettings;
    tr.applyConstraints({width:{ideal:s.width},height:{ideal:s.height},frameRate:{ideal:s.fps,max:s.fps}}).then(()=>toast(`Transmissão ajustada para ${s.height}p / ${s.fps} FPS.`)).catch(()=>{});
    for(const pc of Object.values(voicePeers||{}))for(const sender of pc.getSenders?.()||[]){if(sender.track===tr){try{const p=sender.getParameters();p.degradationPreference='maintain-resolution';p.encodings=p.encodings?.length?p.encodings:[{}];p.encodings[0].maxFramerate=s.fps;p.encodings[0].maxBitrate=s.height>=1080?16000000:9000000;sender.setParameters(p).catch(()=>{})}catch{}}}
  }
  function ensureShareMenu(){let m=$('nfShareMenuV35');if(!m){m=document.createElement('div');m.id='nfShareMenuV35';m.className='nf-share-menu';document.body.appendChild(m)}return m}
  function openShareMenu(anchor){
    const s=window.nfShareSettings,m=ensureShareMenu();
    m.innerHTML=`<button id="nfChangeSourceV35">Alterar a transmissão</button><div class="sep"></div><div class="title">Qualidade</div><div class="choices"><button data-q="720" class="${s.height===720?'active':''}">720p</button><button data-q="1080" class="${s.height===1080?'active':''}">1080p</button></div><div class="title">Taxa de quadros</div><div class="choices"><button data-f="30" class="${s.fps===30?'active':''}">30 FPS</button><button data-f="60" class="${s.fps===60?'active':''}">60 FPS</button></div>`;
    const r=anchor.getBoundingClientRect();m.style.left=Math.max(8,Math.min(innerWidth-298,r.left))+'px';m.style.top=Math.max(8,r.top-225)+'px';m.classList.add('show');
    $('nfChangeSourceV35').onclick=()=>{m.classList.remove('show');openSharePicker()};
    m.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const h=+b.dataset.q;window.nfShareSettings={...s,height:h,width:h===1080?1920:1280};applyShareSettings();openShareMenu(anchor)});
    m.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{window.nfShareSettings={...window.nfShareSettings,fps:+b.dataset.f};applyShareSettings();openShareMenu(anchor)});
  }
  function refreshShareControl(){
    const btn=$('callShareBtn');if(!btn)return;
    const active=!!localScreenStream;btn.classList.toggle('nf-share-active',active);
    const group=btn.parentElement?.classList.contains('nf-share-group')?btn.parentElement:null;
    if(active&&!group){const g=document.createElement('span');g.className='nf-share-group';btn.parentNode.insertBefore(g,btn);g.appendChild(btn);const a=document.createElement('button');a.className='nf-share-arrow';a.title='Opções da transmissão';a.innerHTML='<svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:3"><path d="m6 9 6 6 6-6"/></svg>';a.onclick=e=>{e.stopPropagation();openShareMenu(a)};g.appendChild(a)}
    if(!active&&group){const p=group.parentNode;p.insertBefore(btn,group);group.remove()}
  }
  document.addEventListener('click',e=>{const m=$('nfShareMenuV35');if(m?.classList.contains('show')&&!e.target.closest('#nfShareMenuV35,.nf-share-arrow'))m.classList.remove('show')},true);

  ensureVersion();
  const mo=new MutationObserver(()=>{ensureVersion();refreshShareControl();if($('serverSettingsModal')?.classList.contains('active'))$('nfServerIconEditor')?.remove()});
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setInterval(refreshShareControl,500);
})();
