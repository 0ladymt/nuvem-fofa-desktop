// Nuvem Fofa v0.3.2 — correções incrementais sem mexer na base aprovada
(() => {
  const $ = id => document.getElementById(id);

  // Convites criados no desktop precisam apontar para uma URL pública que outra
  // pessoa consiga abrir, e não para file:///... da instalação local.
  window.getPublicInviteBase = function getPublicInviteBase(){
    const configured = localStorage.getItem('nuvemPublicUrl');
    if(configured) return configured.replace(/\/$/, '');
    if(location.protocol === 'http:' || location.protocol === 'https:') return location.origin + location.pathname.replace(/\/$/, '');
    return 'https://nuvemfofa.netlify.app/';
  };

  const originalCreateInvite = window.createServerInvite;
  if(typeof originalCreateInvite === 'function'){
    window.createServerInvite = async function(){
      await originalCreateInvite();
      const input = $('inviteLink');
      if(!input?.value) return;
      try{
        const oldUrl = new URL(input.value);
        const code = oldUrl.searchParams.get('invite');
        if(code) input.value = `${getPublicInviteBase()}?invite=${encodeURIComponent(code)}`;
      }catch{}
    };
  }

  // Links de convite recebidos em mensagens ficam clicáveis e abrem o fluxo de entrada.
  function inviteCodeFromText(text){
    const m = String(text || '').match(/(?:https?:\/\/[^\s]+|file:\/\/\/[^\s]+)[?&]invite=([A-Za-z0-9_-]+)/i);
    return m?.[1] || null;
  }
  async function openInviteCode(code){
    if(!code || !window.db || !window.currentUser) return;
    const s = await db.ref('serverInvites/' + code).once('value');
    if(!s.exists()) return window.toast?.('Convite inválido ou expirado.');
    const inv = s.val();
    const sv = await db.ref('servers/' + inv.serverId).once('value');
    if(!sv.exists()) return window.toast?.('Servidor não existe mais.');
    const server = sv.val() || {};
    if(server.createdBy === currentUser.uid || server.members?.[currentUser.uid]) return window.toast?.('Você já participa deste servidor.');
    window.pendingInvite = {code, ...inv, server};
    const owner = await db.ref('users/' + server.createdBy).once('value');
    const count = (server.members ? Object.keys(server.members).length : 0) + (server.createdBy && !server.members?.[server.createdBy] ? 1 : 0);
    const box = $('inviteJoinText');
    if(box) box.innerHTML = `<div class="invite-rich-banner" style="background-image:${server.cover ? `url(${server.cover})` : 'linear-gradient(135deg,#5865f2,#7c3aed)'}"></div><div class="invite-rich-body"><div class="invite-rich-icon">${(server.name||'S').split(/\s+/).map(x=>x[0]).join('').slice(0,3).toUpperCase()}</div><div class="muted tiny" style="margin-top:10px">VOCÊ FOI CONVIDADA PARA</div><h2>${server.name||'Servidor'}</h2><div class="invite-rich-stats">${count} membro${count===1?'':'s'} · Convite de ${owner.val()?.username||'um membro'}</div><p class="muted">Ao entrar, este servidor aparecerá na sua barra lateral.</p></div>`;
    window.openModal?.('inviteJoinModal');
  }

  document.addEventListener('click', e => {
    const textEl = e.target.closest?.('.msg-text');
    if(!textEl) return;
    const code = inviteCodeFromText(textEl.textContent);
    if(code){ e.preventDefault(); openInviteCode(code); }
  });
  const obs = new MutationObserver(() => {
    document.querySelectorAll('.msg-text').forEach(el => {
      const code = inviteCodeFromText(el.textContent);
      if(code && !el.dataset.inviteReady){
        el.dataset.inviteReady='1'; el.classList.add('nf-invite-message'); el.title='Abrir convite do servidor';
      }
    });
  });
  obs.observe(document.documentElement,{subtree:true,childList:true});

  // Visualizador realmente em tela cheia para transmissões e fotos.
  window.toggleStreamFocusFullscreen = async function(){
    const focus = $('streamFocus');
    if(!focus) return;
    try{
      if(document.fullscreenElement) await document.exitFullscreen();
      else await focus.requestFullscreen();
    }catch{ window.toast?.('Não foi possível abrir em tela cheia.'); }
  };

  document.addEventListener('dblclick', e => {
    const v = e.target.closest?.('#streamFocusVideo');
    if(v) toggleStreamFocusFullscreen();
  });

  // Foto de perfil: um clique já abre grande; duplo clique entra em fullscreen.
  document.addEventListener('dblclick', async e => {
    const img = e.target.closest?.('.profile-avatar-hd,.voice-avatar-xl,.avatar-full');
    if(!img) return;
    window.openAvatarFullscreen?.(img.src);
    setTimeout(async()=>{try{const viewer=$('mediaViewer');if(viewer&&!document.fullscreenElement)await viewer.requestFullscreen()}catch{}},60);
  });

  // Botão extra no overlay de transmissão sem depender do ícone antigo.
  const focusObs = new MutationObserver(() => {
    const focus = $('streamFocus');
    if(!focus || focus.querySelector('.nf-real-fullscreen')) return;
    const controls = focus.querySelector('.stream-focus-controls');
    if(!controls) return;
    const b=document.createElement('button'); b.className='secondary nf-real-fullscreen'; b.textContent='Tela cheia'; b.onclick=toggleStreamFocusFullscreen; controls.appendChild(b);
  });
  focusObs.observe(document.documentElement,{subtree:true,childList:true});
})();