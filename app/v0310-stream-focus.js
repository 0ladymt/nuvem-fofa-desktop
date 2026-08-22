// Nuvem Fofa v0.3.10 — foco exclusivo em compartilhamento e fullscreen
(() => {
  const $ = id => document.getElementById(id);
  const qa = (s,r=document)=>[...r.querySelectorAll(s)];

  const css=document.createElement('style');
  css.textContent=`
    /* === seletor de compartilhamento inspirado no comportamento do Discord === */
    .modal.active .nf-discord-share-shell{background:#18191c!important;border:1px solid #2f3136!important;border-radius:14px!important;box-shadow:0 24px 70px #000b!important;overflow:hidden!important}
    .modal.active .nf-discord-share-shell .modal-head{display:none!important}
    .modal.active .nf-discord-share-shell .modal-body{padding:18px!important;background:#18191c!important}
    .modal.active .nf-discord-share-shell .nf-share-quality,#nfShareQuality{display:none!important}
    .modal.active .nf-discord-share-shell .nf-discord-picker-head{display:grid;grid-template-columns:repeat(3,1fr);gap:0;background:#0f1012;border-radius:12px;padding:4px;margin-bottom:16px;position:sticky;top:0;z-index:4}
    .modal.active .nf-discord-share-shell .nf-discord-picker-tab{border:0;background:transparent;color:#b5bac1;padding:11px 12px;border-radius:9px;display:flex;align-items:center;justify-content:center;gap:9px;font-weight:650;cursor:pointer}
    .modal.active .nf-discord-share-shell .nf-discord-picker-tab.active{background:#232428;color:#fff}
    .modal.active .nf-discord-share-shell .nf-discord-picker-tab svg{width:18px;height:18px;fill:currentColor}
    .modal.active .nf-discord-share-shell .nf-discord-bottom{display:flex;align-items:center;gap:14px;margin-top:14px;padding-top:12px;border-top:1px solid #2f3136}
    .modal.active .nf-discord-share-shell .nf-discord-bottom .mode{min-width:0;flex:1}
    .modal.active .nf-discord-share-shell .nf-discord-bottom .mode b{display:block;font-size:14px;margin-bottom:3px}
    .modal.active .nf-discord-share-shell .nf-discord-bottom .mode small{color:#b5bac1}
    .modal.active .nf-discord-share-shell .nf-discord-gear{width:42px;height:42px;border:0;border-radius:8px;background:#232428;color:#fff;display:grid;place-items:center;cursor:pointer}
    .modal.active .nf-discord-share-shell .nf-discord-gear:hover{background:#35373c}
    .modal.active .nf-discord-share-shell .modal-actions{background:#18191c!important;border-top:0!important;padding:8px 18px 18px!important}

    /* grade de fontes mais próxima do Discord */
    .modal.active .nf-discord-share-shell [class*="source"],
    .modal.active .nf-discord-share-shell [class*="capture"]{border-radius:10px}
    .modal.active .nf-discord-share-shell img{filter:none!important;mix-blend-mode:normal!important}

    /* === fullscreen dedicado da transmissão === */
    #nfDiscordFullscreen310{position:fixed;inset:0;z-index:2147483646;background:#000;display:none;color:#fff;overflow:hidden}
    #nfDiscordFullscreen310.show{display:block}
    #nfDiscordFullscreen310 .nf310-stage{position:absolute;inset:0;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden}
    #nfDiscordFullscreen310 .nf310-stage video{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;background:#000!important;filter:none!important;transform:none!important}
    #nfDiscordFullscreen310 .nf310-top{position:absolute;left:0;right:0;top:0;height:52px;padding:0 18px;display:flex;align-items:center;gap:10px;z-index:5;background:linear-gradient(#000b,transparent);pointer-events:none}
    #nfDiscordFullscreen310 .nf310-title{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #nfDiscordFullscreen310 .nf310-spacer{flex:1}
    #nfDiscordFullscreen310 .nf310-badge{font-size:12px;font-weight:750;background:#4e5058dd;padding:4px 7px;border-radius:5px}
    #nfDiscordFullscreen310 .nf310-live{background:#da373c}
    #nfDiscordFullscreen310 .nf310-exit{position:absolute;right:18px;bottom:18px;width:42px;height:42px;border:0;border-radius:8px;background:#1e1f22e8;color:#fff;z-index:6;display:grid;place-items:center;cursor:pointer;opacity:.92}
    #nfDiscordFullscreen310 .nf310-exit:hover{background:#35373c}
    #nfDiscordFullscreen310 .nf310-hint{position:absolute;left:14px;bottom:16px;padding:6px 9px;border-radius:6px;background:#111a;color:#ddd;font-size:12px;z-index:5;opacity:.72}
  `;
  document.head.appendChild(css);

  const icon=(name)=>({
    apps:'<svg viewBox="0 0 24 24"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 3v9h16V8H4Z"/></svg>',
    screen:'<svg viewBox="0 0 24 24"><path d="M3 4h18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-7v2h3v2H7v-2h3v-2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v11h18V6H3Z"/></svg>',
    device:'<svg viewBox="0 0 24 24"><path d="M4 6h11a2 2 0 0 1 2 2v1.2l4-2.4a1 1 0 0 1 1.5.86v8.68A1 1 0 0 1 21 17.2l-4-2.4V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/></svg>',
    gear:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm9.4 2.2-1.7-.5a8 8 0 0 0-.7-1.7l.9-1.5-2.9-2.9-1.5.9a8 8 0 0 0-1.7-.7L13.3 2h-2.6l-.5 1.7a8 8 0 0 0-1.7.7L7 3.5 4.1 6.4 5 7.9a8 8 0 0 0-.7 1.7l-1.7.5v3.8l1.7.5a8 8 0 0 0 .7 1.7l-.9 1.5L7 20.5l1.5-.9a8 8 0 0 0 1.7.7l.5 1.7h2.6l.5-1.7a8 8 0 0 0 1.7-.7l1.5.9 2.9-2.9-.9-1.5a8 8 0 0 0 .7-1.7l1.7-.5v-3.8ZM12 17.5A5.5 5.5 0 1 1 12 6.5a5.5 5.5 0 0 1 0 11Z"/></svg>'
  })[name]||'';

  function findShareModal(){
    return qa('.modal.active').find(m=>/compartilhar tela|iniciar transmissão|aplicativos|tela inteira/i.test(m.textContent||''));
  }

  function enhanceSharePicker(){
    const modal=findShareModal(); if(!modal)return;
    const card=modal.querySelector('.modal-card')||modal.firstElementChild; if(!card||card.dataset.nf310==='1')return;
    card.dataset.nf310='1'; card.classList.add('nf-discord-share-shell');
    const body=card.querySelector('.modal-body')||card;

    const head=document.createElement('div');head.className='nf-discord-picker-head';
    const tabs=[['apps','Aplicativos'],['screen','Tela Inteira'],['device','Dispositivos']];
    tabs.forEach(([k,label],i)=>{const b=document.createElement('button');b.className='nf-discord-picker-tab'+(i===0?' active':'');b.dataset.nfTab=k;b.innerHTML=icon(k)+`<span>${label}</span>`;head.appendChild(b)});
    body.prepend(head);

    // Integra com tabs já existentes em vez de recriar a lógica de captura.
    const nativeButtons=qa('button',body).filter(b=>/aplicativos|tela inteira/i.test(b.textContent||'')&&!b.closest('.nf-discord-picker-head'));
    head.onclick=e=>{
      const b=e.target.closest('.nf-discord-picker-tab');if(!b)return;
      qa('.nf-discord-picker-tab',head).forEach(x=>x.classList.toggle('active',x===b));
      if(b.dataset.nfTab==='apps') nativeButtons.find(x=>/aplicativos/i.test(x.textContent||''))?.click();
      else if(b.dataset.nfTab==='screen') nativeButtons.find(x=>/tela inteira/i.test(x.textContent||''))?.click();
      else if(typeof toast==='function') toast('Dispositivos de vídeo ficarão disponíveis nesta guia.');
    };
    nativeButtons.forEach(b=>b.style.display='none');

    const bottom=document.createElement('div');bottom.className='nf-discord-bottom';
    const mode=document.createElement('div');mode.className='mode';
    const s=window.nfShareSettings||{height:1080,fps:60};
    mode.innerHTML=`<b>Jogos</b><small>Vídeo mais suave · ${s.height||1080}p · ${s.fps||60}fps</small>`;
    const gear=document.createElement('button');gear.className='nf-discord-gear';gear.title='Configurações da transmissão';gear.innerHTML=icon('gear');
    gear.onclick=()=>{const q=body.querySelector('#nfShareQuality')||document.querySelector('#nfShareQuality');if(q){q.style.display=q.style.display==='block'?'none':'block';q.style.position='absolute';q.style.right='18px';q.style.bottom='72px';q.style.zIndex='20'}else if(typeof toast==='function')toast('Use a seta verde durante a transmissão para alterar qualidade e FPS.')};
    bottom.append(mode,gear);body.appendChild(bottom);
  }

  const pickerObs=new MutationObserver(()=>requestAnimationFrame(enhanceSharePicker));
  pickerObs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',()=>setTimeout(enhanceSharePicker,0),true);

  // === fullscreen sem espelho infinito da própria janela ===
  let fsState=null;
  function ensureFs(){
    let box=$('nfDiscordFullscreen310');if(box)return box;
    box=document.createElement('div');box.id='nfDiscordFullscreen310';
    box.innerHTML=`<div class="nf310-stage"></div><div class="nf310-top"><div class="nf310-title">Transmissão</div><div class="nf310-spacer"></div><div class="nf310-badge" id="nf310Quality">1080p 60FPS</div><div class="nf310-badge nf310-live">AO VIVO</div></div><div class="nf310-hint">Esc para sair</div><button class="nf310-exit" title="Sair da tela cheia">${icon('screen')}</button>`;
    document.body.appendChild(box);box.querySelector('.nf310-exit').onclick=exitFs;return box;
  }

  async function exitFs(){
    const box=$('nfDiscordFullscreen310');
    if(fsState?.video&&fsState?.placeholder){
      try{fsState.placeholder.replaceWith(fsState.video)}catch{try{fsState.parent?.appendChild(fsState.video)}catch{}}
      fsState.video.style.cssText=fsState.style||'';
      try{await fsState.video.play()}catch{}
    }
    fsState=null;box?.classList.remove('show');
    try{await window.nuvemDesktop?.setCaptureProtection?.(false)}catch{}
    try{await window.nuvemDesktop?.setFullscreen?.(false)}catch{}
  }

  window.fullscreenTile=async function(id){
    const tile=$(id),video=tile?.querySelector('video');
    if(!video?.srcObject){if(typeof toast==='function')toast('Esta área não possui uma transmissão.');return}
    if(fsState)await exitFs();

    // Para captura de monitor, o Electron exclui temporariamente a própria janela Nuvem Fofa
    // do frame capturado. Assim a pessoa continua vendo a transmissão em fullscreen localmente,
    // enquanto o stream não captura o próprio player de novo em cascata.
    let capture={};try{capture=await window.nuvemDesktop?.getCaptureState?.()||{}}catch{}
    if(capture.type==='screen')try{await window.nuvemDesktop?.setCaptureProtection?.(true)}catch{}

    const box=ensureFs(),stage=box.querySelector('.nf310-stage');
    const ph=document.createComment('nf310-fullscreen');
    const parent=video.parentNode;parent?.insertBefore(ph,video);
    fsState={video,parent,placeholder:ph,style:video.style.cssText};
    stage.appendChild(video);
    video.style.cssText='width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;background:#000!important;filter:none!important;transform:none!important;';
    const s=window.nfShareSettings||{};const q=$('nf310Quality');if(q)q.textContent=`${s.height||1080}p ${s.fps||60}FPS`;
    const title=box.querySelector('.nf310-title');if(title)title.textContent=(capture.name||'Transmissão');
    box.classList.add('show');
    try{await window.nuvemDesktop?.setFullscreen?.(true)}catch{}
    try{await video.play()}catch{}
  };

  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('nfDiscordFullscreen310')?.classList.contains('show')){e.preventDefault();e.stopImmediatePropagation();exitFs()}},true);

  // Garante que overlays antigos nunca apareçam por cima da versão nova.
  function disableLegacy(){
    ['nfDiscordFullscreen'].forEach(id=>{const el=$(id);if(el){el.classList.remove('show');el.style.display='none'}});
  }
  setInterval(disableLegacy,1200);
})();
