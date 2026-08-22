// Nuvem Fofa v0.3.7 — correções de perfil, convites, fullscreen, controles e layout
(() => {
  const $ = id => document.getElementById(id);
  const qa = (s,r=document)=>[...r.querySelectorAll(s)];

  const css=document.createElement('style');
  css.textContent=`
    /* estados da call, espelhando o comportamento visual do Discord */
    .voice-control,.voice-big-btn{transition:background .14s ease,color .14s ease,border-color .14s ease!important}
    #voiceMicBtn.muted,#callMicBtn.muted,#voiceDeafenBtn.deafened,#callDeafenBtn.deafened{background:#da373c!important;color:#fff!important}
    #voiceShareBtn.active,#callShareBtn.active,#callShareBtn.nf-share-active{background:#248046!important;color:#fff!important}
    .voice-control.danger,.voice-big-btn.danger{background:#da373c!important;color:#fff!important}
    .nf-share-group{display:inline-flex!important;align-items:stretch!important}
    .nf-share-group>#callShareBtn{border-radius:999px 0 0 999px!important}
    .nf-share-arrow{background:#248046!important;color:#fff!important;border-left:1px solid rgba(255,255,255,.22)!important}

    /* menu da transmissão no formato vertical do Discord */
    #nfDiscordShareMenu{position:fixed;z-index:2147483600;width:300px;background:#111214;border:1px solid #2f3136;border-radius:10px;padding:8px;color:#f2f3f5;box-shadow:0 18px 60px #000b;display:none}
    #nfDiscordShareMenu.show{display:block}
    #nfDiscordShareMenu button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;background:transparent;color:inherit;text-align:left;padding:10px 11px;border-radius:6px;cursor:pointer;font-weight:600}
    #nfDiscordShareMenu button:hover{background:#35373c}
    #nfDiscordShareMenu .danger-row{color:#f23f42}
    #nfDiscordShareMenu .sep{height:1px;background:#3f4147;margin:6px 4px}
    #nfDiscordShareMenu .sub{position:absolute;width:220px;background:#111214;border:1px solid #2f3136;border-radius:10px;padding:8px;box-shadow:0 18px 60px #000b;display:none}
    #nfDiscordShareMenu .sub.show{display:block}
    #nfDiscordShareMenu .sub-title{font-size:11px;text-transform:uppercase;color:#949ba4;font-weight:800;padding:7px 10px}
    #nfDiscordShareMenu .choice{font-weight:500!important}
    #nfDiscordShareMenu .choice.active::after{content:'●';color:#5865f2;font-size:18px}
    #nfDiscordShareMenu .toggle-on::after{content:'✓';display:grid;place-items:center;width:18px;height:18px;border-radius:4px;background:#5865f2;color:#fff}

    /* fullscreen dedicado apenas à transmissão */
    #nfDiscordFullscreen{position:fixed;inset:0;background:#000!important;z-index:2147483640;display:none;overflow:hidden}
    #nfDiscordFullscreen.show{display:flex;align-items:center;justify-content:center}
    #nfDiscordFullscreen video{width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;object-fit:contain!important;background:#000!important;filter:none!important}
    #nfDiscordFullscreen .fs-exit{position:fixed;right:16px;bottom:16px;width:42px;height:42px;border:0;border-radius:8px;background:#1e1f22e6;color:#fff;cursor:pointer;z-index:2}
    #nfDiscordFullscreen .fs-title{position:fixed;left:18px;top:14px;color:#f2f3f5;font-size:13px;font-weight:700;background:#111a;padding:6px 9px;border-radius:6px;z-index:2}

    /* configurações do servidor com duas colunas claras e alinhadas */
    #serverSettingsModal .modal-card{width:min(1040px,96vw)!important;max-height:88vh!important;overflow:hidden!important}
    #serverSettingsModal .modal-body{display:block!important;padding:20px!important;max-height:calc(88vh - 126px)!important;overflow:auto!important}
    #serverSettingsModal .nf-server-columns{display:grid;grid-template-columns:minmax(330px,.9fr) minmax(390px,1.1fr);gap:22px;align-items:start}
    #serverSettingsModal .nf-server-col{display:flex;flex-direction:column;gap:14px;min-width:0}
    #serverSettingsModal .nf-server-section{background:#2b2d31;border:1px solid #3f4147;border-radius:10px;padding:16px}
    #serverSettingsModal .server-icon-row{display:flex!important;align-items:center!important;gap:14px!important}
    #serverSettingsModal #serverCoverPreview{height:170px!important;margin:0!important}
    #serverSettingsModal .field{margin:0!important}
    #serverSettingsModal .notice{margin:0!important}
    #serverSettingsModal .server-members-card,#serverSettingsModal .leave-server-section{margin:0!important}
    #serverSettingsModal hr{display:none!important}
    @media(max-width:850px){#serverSettingsModal .nf-server-columns{grid-template-columns:1fr}}

    /* nunca aplicar filtros de cor nas fotos */
    img,.avatar,.msg-avatar,.profile-avatar-hd,.voice-avatar-xl,#profileAvatarPreview,#viewUserAvatar,.media-viewer-body img{filter:none!important;-webkit-filter:none!important;mix-blend-mode:normal!important;opacity:1!important}
  `;
  document.head.appendChild(css);

  function refreshOwnAvatar(src){
    if(!src)return;
    ['meAvatar','profileAvatarPreview','viewUserAvatar'].forEach(id=>{const el=$(id);if(el&&el.tagName==='IMG')el.src=src});
    qa(`[data-voice-user="${currentUser?.uid||''}"] img`).forEach(img=>img.src=src);
    qa('.voice-panel-user img').forEach(img=>img.src=src);
  }

  // Salvar perfil e refletir imediatamente no estado local e na call.
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
      if(patch.avatar){
        refreshOwnAvatar(patch.avatar);
        if(voiceRoom)await db.ref(`voiceParticipants/${voiceRoom.channelId}/${currentUser.uid}/avatar`).set(patch.avatar).catch(()=>{});
      }
      pendingAvatarData=null;pendingBannerData=null;
      if(typeof loadMyProfile==='function')loadMyProfile();
      if(voiceRoom){renderVoicePanel();refreshVoiceCallGrid();refreshVoiceSidebarParticipants();}
      closeModal('profileModal');
      toast('Perfil atualizado.');
    }catch(e){toast('Erro ao salvar perfil: '+(e.message||''))}
  };

  // Reorganiza visualmente o modal sem duplicar nenhum campo.
  function organizeServerSettings(){
    const modal=$('serverSettingsModal'),body=modal?.querySelector('.modal-body');
    if(!body||body.querySelector('.nf-server-columns'))return;
    const children=[...body.children];
    const cols=document.createElement('div');cols.className='nf-server-columns';
    const left=document.createElement('div');left.className='nf-server-col';
    const right=document.createElement('div');right.className='nf-server-col';
    const identity=document.createElement('section');identity.className='nf-server-section';
    const invite=document.createElement('section');invite.className='nf-server-section';
    const members=document.createElement('section');members.className='nf-server-section';
    const leave=document.createElement('section');leave.className='nf-server-section';
    const icon=$('serverIconPreview')?.closest('.server-icon-row');
    const cover=$('serverCoverPreview');
    const name=$('serverEditName')?.closest('.field');
    const coverInput=$('serverCoverInput');
    const coverBtn=coverInput?.nextElementSibling;
    const notice=coverBtn?.nextElementSibling;
    [icon,cover,name,coverInput,coverBtn,notice].filter(Boolean).forEach(x=>identity.appendChild(x));
    const h3=children.find(x=>x.tagName==='H3'&&/convite/i.test(x.textContent||''));
    if(h3){let n=h3;while(n&&n!==body.querySelector('.server-members-card')){const next=n.nextElementSibling;invite.appendChild(n);n=next}}
    const memberCard=$('serverMemberManager')?.closest('.server-members-card');if(memberCard)members.appendChild(memberCard);
    const leaveSec=$('leaveServerSection');if(leaveSec)leave.appendChild(leaveSec);
    left.append(identity);right.append(invite,members,leave);cols.append(left,right);
    body.innerHTML='';body.appendChild(cols);
  }
  const openServerSettingsV37=openServerSettings;
  openServerSettings=async function(){await openServerSettingsV37();setTimeout(organizeServerSettings,35)};

  // Convites: códigos fixos de 10 caracteres e sanitização de links que receberam texto extra.
  const normalizeInviteCode=v=>String(v||'').toUpperCase().match(/[A-Z0-9]{10}/)?.[0]||'';
  createServerInvite=async function(){
    if(!currentServer||!currentUser)return;
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';
    if(window.crypto?.getRandomValues){const a=new Uint32Array(10);crypto.getRandomValues(a);for(const n of a)code+=chars[n%chars.length]}
    else for(let i=0;i<10;i++)code+=chars[Math.floor(Math.random()*chars.length)];
    await db.ref('serverInvites/'+code).set({serverId:currentServer,createdBy:currentUser.uid,createdAt:firebase.database.ServerValue.TIMESTAMP,active:true});
    const link='https://nuvemfofa.netlify.app/?invite='+code;
    if($('inviteLink'))$('inviteLink').value=link;
    $('inviteBox')?.classList.remove('hidden');
    toast('Link de convite criado.');
  };
  async function openInviteCode(raw){
    const code=normalizeInviteCode(raw);if(!code)return toast('Convite inválido ou expirado.');
    try{
      const s=await db.ref('serverInvites/'+code).once('value');if(!s.exists())return toast('Convite inválido ou expirado.');
      const inv=s.val()||{};if(inv.active===false)return toast('Convite inválido ou expirado.');
      const sv=await db.ref('servers/'+inv.serverId).once('value');if(!sv.exists())return toast('Servidor não existe mais.');
      const server=sv.val()||{};
      if(server.createdBy===currentUser.uid||server.members?.[currentUser.uid]){closeModal('inviteJoinModal');selectServer(inv.serverId,server);return}
      pendingInvite={code,...inv,server};
      if($('inviteJoinText'))$('inviteJoinText').innerHTML=`Você foi convidada para <b>${esc(server.name||'Servidor')}</b>.`;
      openModal('inviteJoinModal');
    }catch(e){toast('Não foi possível abrir este convite.')}
  }
  processInviteFromUrl=async function(){const raw=new URLSearchParams(location.search).get('invite');if(raw&&currentUser)await openInviteCode(raw)};
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('a[href*="invite="]');
    if(a){e.preventDefault();e.stopImmediatePropagation();try{openInviteCode(new URL(a.href).searchParams.get('invite'))}catch{openInviteCode(a.textContent)}}
    const btn=e.target.closest?.('.nf-invite-card button');
    if(btn){const host=btn.closest('.msg-text,.dm-message-text,.message-content,[data-message-text]')||btn.parentElement?.parentElement;const link=host?.querySelector('a[href*="invite="]');if(link){e.preventDefault();e.stopImmediatePropagation();try{openInviteCode(new URL(link.href).searchParams.get('invite'))}catch{openInviteCode(link.textContent)}}}
  },true);

  // Fullscreen: janela Electron realmente entra em fullscreen e apenas a transmissão ocupa o viewport.
  function ensureFs(){
    let box=$('nfDiscordFullscreen');if(box)return box;
    box=document.createElement('div');box.id='nfDiscordFullscreen';
    box.innerHTML=`<div class="fs-title">Transmissão</div><video autoplay playsinline></video><button class="fs-exit" title="Sair da tela cheia">${nfIcon('screen')}</button>`;
    document.body.appendChild(box);box.querySelector('.fs-exit').onclick=closeFs;return box;
  }
  async function closeFs(){const box=$('nfDiscordFullscreen');if(box){const v=box.querySelector('video');try{v.pause()}catch{}v.srcObject=null;box.classList.remove('show')}await window.nuvemDesktop?.setFullscreen?.(false)}
  fullscreenTile=async function(id){
    const src=$(id)?.querySelector('video');if(!src?.srcObject)return toast('Esta área não possui uma transmissão.');
    const box=ensureFs(),v=box.querySelector('video');v.srcObject=src.srcObject;v.muted=src.muted;box.classList.add('show');
    await window.nuvemDesktop?.setFullscreen?.(true);v.play().catch(()=>{});
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('nfDiscordFullscreen')?.classList.contains('show')){e.preventDefault();closeFs()}},true);

  function applyShareSettingsV37(){
    const tr=localScreenStream?.getVideoTracks?.()[0];if(!tr)return;
    const s=window.nfShareSettings||{height:1080,width:1920,fps:60};
    tr.applyConstraints({width:{ideal:s.width},height:{ideal:s.height},frameRate:{ideal:s.fps,max:s.fps}}).catch(()=>{});
    for(const pc of Object.values(voicePeers||{}))for(const sender of pc.getSenders?.()||[]){if(sender.track===tr){try{const p=sender.getParameters();p.degradationPreference='maintain-resolution';p.encodings=p.encodings?.length?p.encodings:[{}];p.encodings[0].maxFramerate=s.fps;p.encodings[0].maxBitrate=s.height>=1440?22000000:s.height>=1080?16000000:9000000;sender.setParameters(p).catch(()=>{})}catch{}}}
  }
  function showDiscordShareMenu(anchor){
    let m=$('nfDiscordShareMenu');if(!m){m=document.createElement('div');m.id='nfDiscordShareMenu';document.body.appendChild(m)}
    const s=window.nfShareSettings||{height:1080,width:1920,fps:60};
    m.innerHTML=`<button class="danger-row" data-act="stop"><span>Parar de transmitir</span></button><button data-act="source"><span>Alterar a transmissão</span></button><button data-act="quality"><span>Qualidade da transmissão</span><span>›</span></button><button data-act="audio" class="toggle-on"><span>Compartilhar áudio da transmissão</span></button><div class="sub" id="nfShareQualitySub"><div class="sub-title">Taxa de quadros</div>${[15,30,60].map(f=>`<button class="choice ${s.fps===f?'active':''}" data-f="${f}">${f} FPS</button>`).join('')}<div class="sep"></div><div class="sub-title">Resolução</div>${[[480,854],[720,1280],[1080,1920],[1440,2560]].map(([h,w])=>`<button class="choice ${s.height===h?'active':''}" data-q="${h}" data-w="${w}">${h}p</button>`).join('')}</div>`;
    const r=anchor.getBoundingClientRect();m.style.left=Math.max(10,Math.min(innerWidth-310,r.left-180))+'px';m.style.top=Math.max(10,r.top-260)+'px';m.classList.add('show');
    m.querySelector('[data-act="stop"]').onclick=()=>{m.classList.remove('show');shareVoiceScreen()};
    m.querySelector('[data-act="source"]').onclick=()=>{m.classList.remove('show');openSharePicker()};
    const qBtn=m.querySelector('[data-act="quality"]'),sub=$('nfShareQualitySub');qBtn.onmouseenter=()=>{const mr=m.getBoundingClientRect();sub.style.left=(m.offsetWidth+6)+'px';sub.style.top='70px';sub.classList.add('show')};
    m.onmouseleave=()=>sub.classList.remove('show');
    m.querySelectorAll('[data-f]').forEach(b=>b.onclick=e=>{e.stopPropagation();window.nfShareSettings={...s,fps:+b.dataset.f};applyShareSettingsV37();showDiscordShareMenu(anchor)});
    m.querySelectorAll('[data-q]').forEach(b=>b.onclick=e=>{e.stopPropagation();window.nfShareSettings={...(window.nfShareSettings||s),height:+b.dataset.q,width:+b.dataset.w};applyShareSettingsV37();showDiscordShareMenu(anchor)});
  }
  document.addEventListener('click',e=>{const arrow=e.target.closest?.('.nf-share-arrow');if(arrow){e.preventDefault();e.stopImmediatePropagation();showDiscordShareMenu(arrow);return}const m=$('nfDiscordShareMenu');if(m?.classList.contains('show')&&!e.target.closest('#nfDiscordShareMenu'))m.classList.remove('show')},true);

  function syncCallStates(){
    const mic=$('voiceMicBtn'),share=$('voiceShareBtn'),deaf=$('voiceDeafenBtn');
    mic?.classList.toggle('muted',!!voiceMuted);share?.classList.toggle('active',!!localScreenStream);deaf?.classList.toggle('deafened',!!voiceDeafened);
    const cm=$('callMicBtn'),cs=$('callShareBtn'),cd=$('callDeafenBtn');
    cm?.classList.toggle('muted',!!voiceMuted);cs?.classList.toggle('active',!!localScreenStream);cd?.classList.toggle('deafened',!!voiceDeafened);
  }

  setInterval(()=>{syncCallStates();if($('serverSettingsModal')?.classList.contains('active'))organizeServerSettings()},500);
})();
