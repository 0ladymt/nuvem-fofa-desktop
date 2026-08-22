// Nuvem Fofa v0.3.4 — acabamento da rodada de testes
(() => {
  const $ = id => document.getElementById(id);
  const qsa = (s,r=document) => [...r.querySelectorAll(s)];
  const sleep = ms => new Promise(r=>setTimeout(r,ms));

  const css=document.createElement('style');
  css.textContent=`
    /* versão discreta */
    .nf-app-version{position:fixed;right:7px;bottom:4px;z-index:35;font:10px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--fg3,#949ba4);opacity:.72;pointer-events:none;letter-spacing:.15px}

    /* fullscreen somente da transmissão — sem forçar a janela Electron */
    .nf-stream-focus{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;margin:0!important;border-radius:0!important;background:#000!important;z-index:2147482500!important;display:flex!important;align-items:center!important;justify-content:center!important}
    .nf-stream-focus video{width:100%!important;height:100%!important;max-width:100vw!important;max-height:100vh!important;object-fit:contain!important;background:#000!important}
    .nf-stream-focus .voice-tile-label,.nf-stream-focus .stream-volume,.nf-stream-focus .stream-quality{z-index:2147482502!important}
    .nf-stream-exit{position:fixed;right:18px;top:18px;z-index:2147482600;width:42px;height:42px;border:0;border-radius:10px;background:#202225e8;color:#fff;display:none;place-items:center;cursor:pointer}
    .nf-stream-focus~.nf-stream-exit,.nf-stream-exit.show{display:grid}

    /* servidor: horizontal, organizado e sem editor duplicado */
    #serverSettingsModal .modal-card{width:min(900px,96vw)!important;max-height:min(760px,92vh)!important;overflow:hidden!important}
    #serverSettingsModal .modal-body{overflow:auto;max-height:calc(92vh - 132px);padding:20px 24px;display:grid;grid-template-columns:minmax(260px,.9fr) minmax(340px,1.1fr);gap:18px 22px;align-items:start}
    #serverSettingsModal .server-icon-row{grid-column:1;display:flex;align-items:center;gap:14px;padding:14px;background:var(--surface-card,#2b2d31);border:1px solid var(--border,#3f4147);border-radius:10px;margin:0!important}
    #serverSettingsModal #serverCoverPreview{grid-column:1;margin:0!important;min-height:150px}
    #serverSettingsModal .field{grid-column:1;margin:0!important}
    #serverSettingsModal #serverCoverInput+button,#serverSettingsModal #serverCoverInput+button+.notice{grid-column:1}
    #serverSettingsModal hr{display:none}
    #serverSettingsModal h3,#serverSettingsModal h3+p,#serverSettingsModal h3+p+button,#serverSettingsModal #inviteBox,#serverSettingsModal .server-members-card,#serverSettingsModal .leave-server-section{grid-column:2}
    #serverSettingsModal h3{margin:0 0 -10px}
    #serverSettingsModal .server-members-card{margin:0!important}
    #serverSettingsModal .leave-server-section{margin:0!important}
    #nfServerIconEditor{display:none!important}
    @media(max-width:760px){#serverSettingsModal .modal-body{display:block}#serverSettingsModal .modal-body>*{margin-bottom:12px!important}}

    /* cor original de fotos */
    img,.avatar,.msg-avatar,.profile-avatar-hd,.voice-avatar-xl,#profileAvatarPreview,#viewUserAvatar,.media-viewer-body img,.nf-media-viewer img{filter:none!important;-webkit-filter:none!important;mix-blend-mode:normal!important;opacity:1!important;image-rendering:auto!important;color-scheme:normal!important}
    .media-viewer-body,.nf-media-viewer{filter:none!important}

    /* botão de transmissão ativo e menu */
    .nf-share-active{background:#248046!important;color:white!important;border-color:#248046!important}
    .nf-share-wrap{display:inline-flex;align-items:stretch;position:relative}
    .nf-share-wrap>[onclick*="ScreenShare"],.nf-share-wrap>[onclick*="screenShare"],.nf-share-wrap>[onclick*="openSharePicker"]{border-radius:8px 0 0 8px!important}
    .nf-share-arrow{width:27px;min-width:27px;border:0;border-left:1px solid #ffffff2a;border-radius:0 8px 8px 0;background:#248046;color:#fff;display:grid;place-items:center;cursor:pointer;padding:0}
    .nf-share-arrow svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
    .nf-share-menu{position:fixed;z-index:2147481000;width:285px;background:var(--surface-card,#232428);border:1px solid var(--border,#3f4147);box-shadow:0 16px 50px #0009;border-radius:10px;padding:8px;display:none;color:var(--fg,#f2f3f5)}
    .nf-share-menu.show{display:block}
    .nf-share-menu button{width:100%;border:0;background:transparent;color:inherit;text-align:left;padding:9px 10px;border-radius:7px;cursor:pointer}
    .nf-share-menu button:hover{background:var(--surface-hover,#35373c)}
    .nf-share-menu .sep{height:1px;background:var(--border,#3f4147);margin:6px 2px}.nf-share-menu small{display:block;color:var(--fg3,#949ba4);padding:5px 10px 3px;font-weight:700;text-transform:uppercase;font-size:10px}.nf-share-menu .choice{display:grid;grid-template-columns:1fr 1fr;gap:5px}.nf-share-menu .choice button{text-align:center;background:var(--surface-input,#1e1f22)}.nf-share-menu .choice button.active{background:var(--brand,#5865f2);color:#fff}
  `;
  document.head.appendChild(css);

  // versão no canto inferior direito
  function ensureVersion(){
    let e=$('nfAppVersion'); if(!e){e=document.createElement('div');e.id='nfAppVersion';e.className='nf-app-version';document.body.appendChild(e)}
    e.textContent='v'+(window.nuvemDesktop?.version||'0.3.4');
  }

  // fecha menus/modais principais clicando no backdrop
  document.addEventListener('mousedown',e=>{
    const m=e.target;
    if(!(m instanceof HTMLElement) || !m.classList.contains('modal') || !m.classList.contains('active')) return;
    if(['serverSettingsModal','userProfileModal','profileModal','settingsModal','sharePickerModal'].includes(m.id)) window.closeModal?.(m.id);
  },true);

  // fullscreen confiável: amplia APENAS o tile, sem colocar a janela Electron em fullscreen
  let focusedTile=null;
  function exitStreamFocus(){
    if(focusedTile){focusedTile.classList.remove('nf-stream-focus');focusedTile=null}
    $('nfStreamExit')?.classList.remove('show');
  }
  function enterStreamFocus(el){
    if(!el)return;exitStreamFocus();focusedTile=el;el.classList.add('nf-stream-focus');
    let x=$('nfStreamExit');if(!x){x=document.createElement('button');x.id='nfStreamExit';x.className='nf-stream-exit';x.title='Sair da tela cheia';x.innerHTML='<svg viewBox="0 0 48 48" style="width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:4"><path d="M18 6H6v12M30 6h12v12M6 30v12h12M42 30v12H30"/></svg>';x.onclick=exitStreamFocus;document.body.appendChild(x)}x.classList.add('show');
  }
  window.fullscreenTile=function(id){const el=$(id);if(!el)return;if(el===focusedTile)return exitStreamFocus();enterStreamFocus(el)};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&focusedTile){e.preventDefault();exitStreamFocus()}},true);

  // usa PNG para não aquecer/desaturar a foto durante crop; corrige também serverIcon
  window.applyCrop=function(){
    if(!window.cropState)return;
    const st=window.cropState,{img,type}=st,z=st.z||1,x=st.x||0,y=st.y||0;
    const stage=$('cropStage');const frame=(type==='avatar'||type==='serverIcon')?{w:250,h:250}:{w:Math.min(560,stage.clientWidth*.88),h:190};
    const outW=(type==='avatar'||type==='serverIcon')?1024:1600,outH=(type==='avatar'||type==='serverIcon')?1024:540;
    const base=Math.max(frame.w/img.width,frame.h/img.height)*z,dispW=img.width*base,dispH=img.height*base;
    const sx=outW/frame.w,sy=outH/frame.h,c=document.createElement('canvas');c.width=outW;c.height=outH;
    const ctx=c.getContext('2d',{alpha:false,colorSpace:'srgb'});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.fillStyle='#000';ctx.fillRect(0,0,outW,outH);
    ctx.drawImage(img,(outW-dispW*sx)/2+x*sx,(outH-dispH*sy)/2+y*sy,dispW*sx,dispH*sy);
    const data=c.toDataURL('image/png');
    if(type==='avatar'){window.pendingAvatarData=data;if($('profileAvatarPreview'))$('profileAvatarPreview').src=data}
    else if(type==='serverIcon'){window.pendingServerIcon=data;const p=$('serverIconPreview');if(p){p.style.backgroundImage=`url("${data}")`;p.textContent=''}}
    else if(type==='serverBanner'){window.pendingServerCover=data;if($('serverCoverPreview'))$('serverCoverPreview').style.backgroundImage=`url("${data}")`}
    else{window.pendingBannerData=data;if($('profileBanner'))$('profileBanner').style.backgroundImage=`url("${data}")`}
    if(st.input)st.input.value='';window.cropState=null;window.closeModal?.('cropModal');
  };

  // remove a duplicação introduzida no patch anterior e salva a foto REAL do servidor
  const oldOpenServer=window.openServerSettings;
  if(typeof oldOpenServer==='function') window.openServerSettings=async(...args)=>{
    await oldOpenServer(...args);await sleep(40);$('nfServerIconEditor')?.remove();
    try{const s=await window.db.ref('servers/'+window.currentServer).once('value'),d=s.val()||{};const p=$('serverIconPreview');if(p){p.style.backgroundImage=d.icon?`url("${d.icon}")`:'';p.textContent=d.icon?'':((d.name||'S').match(/\b\w/g)||['S']).join('').slice(0,3).toUpperCase())}}catch{}
  };
  window.saveServerSettings=async function(){
    if(!window.currentServer||!window.db)return;
    const patch={name:$('serverEditName')?.value?.trim()||'Servidor'};
    if(window.pendingServerCover)patch.cover=window.pendingServerCover;
    if(window.pendingServerIcon)patch.icon=window.pendingServerIcon;
    if(!patch.icon){const bg=$('serverIconPreview')?.style.backgroundImage||'';const m=bg.match(/url\(["']?(.*?)["']?\)$/);if(m?.[1]?.startsWith('data:'))patch.icon=m[1]}
    try{await window.db.ref('servers/'+window.currentServer).update(patch);window.closeModal?.('serverSettingsModal');window.toast?.('Servidor atualizado.');const s=await window.db.ref('servers/'+window.currentServer).once('value');window.selectServer?.(window.currentServer,s.val()||patch);window.pendingServerIcon=null;window.pendingServerCover=null}catch(e){window.toast?.('Não foi possível salvar o servidor: '+(e.message||''))}
  };

  // convite: se já participa, ENTRA no servidor em vez de mostrar aviso
  async function goToInvite(code){
    try{const s=await window.db.ref('serverInvites/'+code).once('value');if(!s.exists())return window.toast?.('Convite inválido ou expirado.');const inv=s.val();const sv=await window.db.ref('servers/'+inv.serverId).once('value');if(!sv.exists())return window.toast?.('Servidor não existe mais.');const server=sv.val()||{};
      if(server.createdBy===window.currentUser?.uid||server.members?.[window.currentUser?.uid]){window.closeModal?.('inviteJoinModal');window.selectServer?.(inv.serverId,server);return}
      window.pendingInvite={code,...inv,server};if($('inviteJoinText'))$('inviteJoinText').innerHTML=`Você foi convidada para <b>${server.name||'Servidor'}</b>.`;window.openModal?.('inviteJoinModal');
    }catch(e){window.toast?.('Não foi possível abrir o convite.')}
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('a[href*="nuvemfofa.netlify.app"][href*="invite="]');if(a){e.preventDefault();const code=new URL(a.href).searchParams.get('invite');if(code)goToInvite(code);return}
    const b=e.target.closest?.('.nf-invite-card button');if(b){const host=b.closest('.msg-text,.dm-message-text,.message-content,[data-message-text]');const link=host?.querySelector('a[href*="invite="]');if(link){e.preventDefault();const code=new URL(link.href).searchParams.get('invite');if(code)goToInvite(code)}}
  },true);

  // menu Discord-like para transmissão ativa
  function applyCurrentShareQuality(){
    try{const tr=window.localScreenStream?.getVideoTracks?.()[0];if(!tr)return;const s=window.nfShareSettings||{width:1920,height:1080,fps:60};tr.applyConstraints({width:{ideal:s.width},height:{ideal:s.height},frameRate:{ideal:s.fps,max:s.fps}}).catch(()=>{});window.toast?.(`Transmissão ajustada para ${s.height}p / ${s.fps} FPS.`)}catch{}
  }
  function ensureShareMenu(){let m=$('nfShareMenu');if(m)return m;m=document.createElement('div');m.id='nfShareMenu';m.className='nf-share-menu';document.body.appendChild(m);return m}
  function openShareMenu(anchor){
    const m=ensureShareMenu(),s=window.nfShareSettings||{width:1920,height:1080,fps:60};
    m.innerHTML=`<button id="nfChangeShare">Alterar a transmissão</button><div class="sep"></div><small>Qualidade</small><div class="choice"><button data-q="720" class="${s.height===720?'active':''}">720p</button><button data-q="1080" class="${s.height===1080?'active':''}">1080p</button></div><small>Taxa de quadros</small><div class="choice"><button data-f="30" class="${s.fps===30?'active':''}">30 FPS</button><button data-f="60" class="${s.fps===60?'active':''}">60 FPS</button></div>`;
    const r=anchor.getBoundingClientRect();m.style.left=Math.max(8,Math.min(innerWidth-293,r.left))+'px';m.style.top=Math.max(8,r.top-225)+'px';m.classList.add('show');
    $('nfChangeShare').onclick=()=>{m.classList.remove('show');window.openSharePicker?.()};
    m.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const h=+b.dataset.q;window.nfShareSettings={width:h===1080?1920:1280,height:h,fps:(window.nfShareSettings?.fps||60)};applyCurrentShareQuality();openShareMenu(anchor)});
    m.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{window.nfShareSettings={width:(window.nfShareSettings?.width||1920),height:(window.nfShareSettings?.height||1080),fps:+b.dataset.f};applyCurrentShareQuality();openShareMenu(anchor)});
  }
  function refreshShareButtons(){
    const active=!!window.localScreenStream;
    qsa('[onclick*="openSharePicker"],[onclick*="toggleScreenShare"],[onclick*="ScreenShare"],[title*="Compartilhar tela" i]').forEach(btn=>{
      if(!(btn instanceof HTMLElement))return;btn.classList.toggle('nf-share-active',active);
      const existing=btn.parentElement?.classList.contains('nf-share-wrap')?btn.parentElement:null;
      if(active&&!existing){const wrap=document.createElement('span');wrap.className='nf-share-wrap';btn.parentNode.insertBefore(wrap,btn);wrap.appendChild(btn);const ar=document.createElement('button');ar.className='nf-share-arrow';ar.title='Opções da transmissão';ar.innerHTML='<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';ar.onclick=e=>{e.stopPropagation();openShareMenu(ar)};wrap.appendChild(ar)}
      if(!active&&existing){const parent=existing.parentNode;parent.insertBefore(btn,existing);existing.remove()}
    });
  }
  document.addEventListener('click',e=>{const m=$('nfShareMenu');if(m?.classList.contains('show')&&!e.target.closest('#nfShareMenu,.nf-share-arrow'))m.classList.remove('show')},true);

  ensureVersion();
  const mo=new MutationObserver(()=>{ensureVersion();refreshShareButtons();if($('serverSettingsModal')?.classList.contains('active'))$('nfServerIconEditor')?.remove()});
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setInterval(refreshShareButtons,700);
})();
