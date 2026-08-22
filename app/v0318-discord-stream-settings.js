// Nuvem Fofa v0.3.18 — painel de transmissão inspirado no fluxo do Discord
(() => {
  const $ = id => document.getElementById(id);
  const qa = (s, r=document) => [...r.querySelectorAll(s)];
  const modal = () => $('sharePickerModal');

  const state = window.nf318StreamState = window.nf318StreamState || {
    mode: 'games',
    muteStreamAudio: false,
    hidePreview: false,
    audioDeviceId: localStorage.getItem('nfAudioDeviceId') || 'default',
    audioDeviceLabel: localStorage.getItem('nfAudioDeviceLabel') || 'Padrão do Windows'
  };

  const css = document.createElement('style');
  css.textContent = `
    /* O conteúdo principal fica limpo: fonte primeiro, opções ficam na engrenagem. */
    #sharePickerModal .share-options,
    #sharePickerModal .modal-actions,
    #sharePickerModal .nf-discord-bottom,
    #sharePickerModal .nf316-stream-footer,
    #sharePickerModal .nf-stream-modebar{display:none!important}

    #sharePickerModal .share-picker-card,
    #sharePickerModal .nf-discord-share-shell{
      width:min(930px,94vw)!important;
      max-height:min(760px,90vh)!important;
      overflow:visible!important;
      background:#18191c!important;
      border:1px solid #2b2d31!important;
      border-radius:12px!important;
      box-shadow:0 28px 90px rgba(0,0,0,.72)!important;
    }
    #sharePickerModal .modal-body{overflow:visible!important;background:#18191c!important}
    #sharePickerModal .share-sources{
      max-height:470px!important;
      min-height:280px!important;
      padding:16px 18px 12px!important;
      overflow:auto!important;
      background:#18191c!important;
    }

    /* Rodapé no padrão da referência: resumo + Transmitir + engrenagem. */
    #sharePickerModal .nf318-bottom{
      position:relative!important;
      display:flex!important;
      align-items:center!important;
      gap:10px!important;
      min-height:64px!important;
      padding:10px 14px!important;
      border-top:1px solid #2b2d31!important;
      background:#111214!important;
      flex:0 0 auto!important;
    }
    #sharePickerModal .nf318-mode{min-width:0;flex:1}
    #sharePickerModal .nf318-mode b{display:block;color:#f2f3f5;font-size:13px;line-height:1.2}
    #sharePickerModal .nf318-mode small{display:block;color:#949ba4;font-size:11px;margin-top:3px;line-height:1.2}
    #sharePickerModal .nf318-start{
      height:40px!important;padding:0 17px!important;border:0!important;border-radius:7px!important;
      background:#5865f2!important;color:#fff!important;font-weight:750!important;cursor:pointer!important
    }
    #sharePickerModal .nf318-start:hover:not(:disabled){background:#4752c4!important}
    #sharePickerModal .nf318-start:disabled{opacity:.48!important;cursor:not-allowed!important}
    #sharePickerModal .nf318-gear{
      width:40px!important;height:40px!important;border:0!important;border-radius:8px!important;
      background:#232428!important;color:#f2f3f5!important;display:grid!important;place-items:center!important;cursor:pointer!important
    }
    #sharePickerModal .nf318-gear:hover,#sharePickerModal .nf318-gear.open{background:#35373c!important}
    #sharePickerModal .nf318-gear svg{width:20px;height:20px;fill:currentColor}

    /* Popover da engrenagem — compacto e ancorado como no Discord. */
    #sharePickerModal .nf318-menu{
      position:absolute!important;right:14px!important;bottom:58px!important;width:272px!important;
      padding:8px!important;background:#1e1f22!important;border:1px solid #3f4147!important;
      border-radius:8px!important;box-shadow:0 16px 48px rgba(0,0,0,.58)!important;
      color:#dbdee1!important;z-index:80!important;display:none!important
    }
    #sharePickerModal .nf318-menu.show{display:block!important}
    #sharePickerModal .nf318-menu-title{padding:6px 8px 7px;color:#b5bac1;font-size:13px}
    #sharePickerModal .nf318-row{
      min-height:42px;border:0;width:100%;border-radius:5px;background:transparent;color:#f2f3f5;
      display:flex;align-items:center;gap:8px;padding:7px 8px;text-align:left;cursor:pointer
    }
    #sharePickerModal .nf318-row:hover,#sharePickerModal .nf318-row.active{background:#35373c}
    #sharePickerModal .nf318-row .copy{min-width:0;flex:1}
    #sharePickerModal .nf318-row b{display:block;font-size:13px;font-weight:700}
    #sharePickerModal .nf318-row small{display:block;font-size:11px;color:#949ba4;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #sharePickerModal .nf318-divider{height:1px;background:#3f4147;margin:5px 0}
    #sharePickerModal .nf318-radio{width:20px;height:20px;border:1px solid #73767d;border-radius:50%;display:grid;place-items:center;flex:0 0 auto}
    #sharePickerModal .nf318-radio.on{border-color:#5865f2;background:#5865f2}
    #sharePickerModal .nf318-radio.on:after{content:'';width:7px;height:7px;border-radius:50%;background:#fff}
    #sharePickerModal .nf318-check{width:20px;height:20px;border:1px solid #73767d;border-radius:4px;display:grid;place-items:center;flex:0 0 auto}
    #sharePickerModal .nf318-check.on{background:#5865f2;border-color:#5865f2}
    #sharePickerModal .nf318-check.on:after{content:'✓';font-size:13px;color:#fff;font-weight:900}
    #sharePickerModal .nf318-arrow{font-size:24px;line-height:1;color:#b5bac1;margin-left:auto}

    /* Submenus surgem ao lado, igual ao padrão do Discord. */
    #sharePickerModal .nf318-submenu{
      position:absolute;left:calc(100% + 7px);min-width:270px;padding:8px;background:#1e1f22;
      border:1px solid #3f4147;border-radius:8px;box-shadow:0 16px 48px rgba(0,0,0,.58);display:none
    }
    #sharePickerModal .nf318-submenu.show{display:block}
    #sharePickerModal .nf318-submenu.custom{top:53px}
    #sharePickerModal .nf318-submenu.audio{top:178px}
    #sharePickerModal .nf318-submenu.advanced{bottom:4px}
    #sharePickerModal .nf318-subtitle{padding:5px 8px;color:#949ba4;font-size:11px;font-weight:800;text-transform:uppercase}
    #sharePickerModal .nf318-choice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:3px 6px 8px}
    #sharePickerModal .nf318-choice-grid.two{grid-template-columns:repeat(2,1fr)}
    #sharePickerModal .nf318-choice{
      min-height:36px;border:1px solid #3f4147;border-radius:6px;background:#232428;color:#dbdee1;font-size:12px;font-weight:700;cursor:pointer
    }
    #sharePickerModal .nf318-choice:hover{background:#35373c}
    #sharePickerModal .nf318-choice.active{background:#5865f2;border-color:#5865f2;color:#fff}

    #sharePickerModal.nf318-hide-preview .share-source img{visibility:hidden!important}
    #sharePickerModal.nf318-hide-preview .share-source{background:#232428!important}

    @media(max-width:1060px){
      #sharePickerModal .nf318-submenu{left:auto!important;right:calc(100% + 7px)!important}
    }
  `;
  document.head.appendChild(css);

  const gearSvg = '<svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.7 2.1-1.6-.5a8 8 0 0 0-.7-1.6l.8-1.5-2.2-2.2-1.5.8a8 8 0 0 0-1.6-.7L13.4 3h-2.8l-.5 1.9a8 8 0 0 0-1.6.7L7 4.8 4.8 7l.8 1.5a8 8 0 0 0-.7 1.6l-1.9.5v2.8l1.9.5c.2.6.4 1.1.7 1.6L4.8 17 7 19.2l1.5-.8c.5.3 1 .5 1.6.7l.5 1.9h2.8l.5-1.9c.6-.2 1.1-.4 1.6-.7l1.5.8 2.2-2.2-.8-1.5c.3-.5.5-1 .7-1.6l1.6-.5v-2.8Z"/></svg>';

  function shareSettings(){
    const s = window.sharePickerState || {};
    return {quality:Number(s.quality||1080), fps:Number(s.fps||60)};
  }

  function closeSubmenus(root){ qa('.nf318-submenu',root).forEach(x=>x.classList.remove('show')); }

  function setQuality(q){
    const native = qa('#shareQualityChoices button', modal()).find(b=>Number(b.dataset.value)===Number(q));
    if(native && typeof window.chooseShareQuality==='function') window.chooseShareQuality(q,native);
    else if(window.sharePickerState) window.sharePickerState.quality=Number(q);
    state.mode='custom'; refreshUI();
  }
  function setFps(fps){
    const native = qa('#shareFpsChoices button', modal()).find(b=>Number(b.dataset.value)===Number(fps));
    if(native && typeof window.chooseShareFps==='function') window.chooseShareFps(fps,native);
    else if(window.sharePickerState) window.sharePickerState.fps=Number(fps);
    state.mode='custom'; refreshUI();
  }

  async function loadAudioDevices(root){
    const sub=root.querySelector('.nf318-submenu.audio'); if(!sub)return;
    let devices=[];
    try{ devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput'); }catch{}
    const rows=[{deviceId:'default',label:'Padrão do Windows'},...devices.filter(d=>d.deviceId!=='default').map((d,i)=>({deviceId:d.deviceId,label:d.label||`Microfone ${i+1}`}))];
    sub.innerHTML=rows.map(d=>`<button class="nf318-row ${state.audioDeviceId===d.deviceId?'active':''}" data-audio-id="${escAttr(d.deviceId)}" data-audio-label="${escAttr(d.label)}"><span style="font-size:16px">🎙</span><span class="copy"><b>${escapeHtml(d.label)}</b></span><span class="nf318-radio ${state.audioDeviceId===d.deviceId?'on':''}"></span></button>`).join('');
    qa('[data-audio-id]',sub).forEach(b=>b.onclick=()=>{
      state.audioDeviceId=b.dataset.audioId; state.audioDeviceLabel=b.dataset.audioLabel;
      localStorage.setItem('nfAudioDeviceId',state.audioDeviceId); localStorage.setItem('nfAudioDeviceLabel',state.audioDeviceLabel);
      loadAudioDevices(root); refreshUI();
    });
  }

  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function escAttr(s){return escapeHtml(s).replace(/`/g,'&#096;');}

  function buildMenu(bottom){
    let menu=bottom.querySelector('.nf318-menu'); if(menu)return menu;
    menu=document.createElement('div'); menu.className='nf318-menu';
    menu.innerHTML=`
      <div class="nf318-menu-title">Modo De Transmissão</div>
      <button class="nf318-row" data-mode="games"><span class="copy"><b>Jogos</b><small class="nf318-games-summary"></small></span><span class="nf318-radio"></span></button>
      <button class="nf318-row" data-mode="custom"><span class="copy"><b>Personalizada</b></span><span class="nf318-radio"></span></button>
      <div class="nf318-divider"></div>
      <button class="nf318-row" data-action="mute"><span class="copy"><b>Silenciar áudio da transmissão</b></span><span class="nf318-check"></span></button>
      <button class="nf318-row" data-action="audio"><span class="copy"><b>Dispositivo de áudio</b><small class="nf318-audio-label"></small></span><span class="nf318-arrow">›</span></button>
      <button class="nf318-row" data-action="advanced"><span class="copy"><b>Avançado</b></span><span class="nf318-arrow">›</span></button>
      <div class="nf318-submenu custom">
        <div class="nf318-subtitle">Resolução</div><div class="nf318-choice-grid"><button class="nf318-choice" data-q="720">720p</button><button class="nf318-choice" data-q="1080">1080p</button><button class="nf318-choice" data-q="1440">1440p</button></div>
        <div class="nf318-subtitle">Taxa de quadros</div><div class="nf318-choice-grid two"><button class="nf318-choice" data-fps="30">30 FPS</button><button class="nf318-choice" data-fps="60">60 FPS</button></div>
      </div>
      <div class="nf318-submenu audio"></div>
      <div class="nf318-submenu advanced"><button class="nf318-row" data-action="hide-preview"><span class="copy"><b>Ocultar prévia da transmissão</b></span><span class="nf318-check"></span></button></div>`;
    bottom.appendChild(menu);

    menu.querySelector('[data-mode="games"]').onclick=()=>{state.mode='games';const s=window.sharePickerState;if(s){s.quality=1440;s.fps=60}const qb=qa('#shareQualityChoices button',modal()).find(x=>x.dataset.value==='1440');if(qb)window.chooseShareQuality?.(1440,qb);const fb=qa('#shareFpsChoices button',modal()).find(x=>x.dataset.value==='60');if(fb)window.chooseShareFps?.(60,fb);closeSubmenus(menu);refreshUI()};
    menu.querySelector('[data-mode="custom"]').onclick=e=>{e.stopPropagation();state.mode='custom';closeSubmenus(menu);menu.querySelector('.nf318-submenu.custom').classList.add('show');refreshUI()};
    menu.querySelector('[data-action="mute"]').onclick=()=>{state.muteStreamAudio=!state.muteStreamAudio;const input=$('shareAudioToggle');if(input)input.checked=!state.muteStreamAudio;refreshUI()};
    menu.querySelector('[data-action="audio"]').onclick=async e=>{e.stopPropagation();const sub=menu.querySelector('.nf318-submenu.audio'),will=!sub.classList.contains('show');closeSubmenus(menu);if(will){await loadAudioDevices(menu);sub.classList.add('show')}};
    menu.querySelector('[data-action="advanced"]').onclick=e=>{e.stopPropagation();const sub=menu.querySelector('.nf318-submenu.advanced'),will=!sub.classList.contains('show');closeSubmenus(menu);if(will)sub.classList.add('show')};
    menu.querySelector('[data-action="hide-preview"]').onclick=()=>{state.hidePreview=!state.hidePreview;refreshUI()};
    qa('[data-q]',menu).forEach(b=>b.onclick=e=>{e.stopPropagation();setQuality(Number(b.dataset.q))});
    qa('[data-fps]',menu).forEach(b=>b.onclick=e=>{e.stopPropagation();setFps(Number(b.dataset.fps))});
    return menu;
  }

  function ensureBottom(){
    const m=modal(); if(!m)return;
    const card=m.querySelector('.share-picker-card,.nf-discord-share-shell'); if(!card)return;
    let bottom=card.querySelector('.nf318-bottom');
    if(!bottom){
      bottom=document.createElement('div');bottom.className='nf318-bottom';
      bottom.innerHTML=`<div class="nf318-mode"><b>Jogos</b><small></small></div><button class="nf318-start" type="button">Transmitir</button><button class="nf318-gear" type="button" title="Configurações da transmissão">${gearSvg}</button>`;
      card.appendChild(bottom);
      const gear=bottom.querySelector('.nf318-gear');
      gear.onclick=e=>{e.stopPropagation();const menu=buildMenu(bottom);const will=!menu.classList.contains('show');menu.classList.toggle('show',will);gear.classList.toggle('open',will);if(!will)closeSubmenus(menu);refreshUI()};
      bottom.querySelector('.nf318-start').onclick=()=>window.startSelectedShare?.();
      buildMenu(bottom);
    }
    refreshUI();
  }

  function refreshUI(){
    const m=modal(); if(!m)return;
    const bottom=m.querySelector('.nf318-bottom'); if(!bottom)return;
    const s=shareSettings();
    const mode=bottom.querySelector('.nf318-mode');
    if(mode){mode.querySelector('b').textContent=state.mode==='games'?'Jogos':'Personalizada';mode.querySelector('small').textContent=`Vídeo mais suave · ${s.quality}p · ${s.fps}fps`;}
    const start=bottom.querySelector('.nf318-start');if(start)start.disabled=!window.sharePickerState?.sourceId;
    const menu=bottom.querySelector('.nf318-menu');if(menu){
      menu.querySelector('.nf318-games-summary').textContent=`Vídeo mais suave (${s.quality}p, ${s.fps}fps)`;
      menu.querySelector('.nf318-audio-label').textContent=state.audioDeviceLabel;
      qa('[data-mode]',menu).forEach(b=>{const on=b.dataset.mode===state.mode;b.classList.toggle('active',on);b.querySelector('.nf318-radio')?.classList.toggle('on',on)});
      menu.querySelector('[data-action="mute"] .nf318-check')?.classList.toggle('on',state.muteStreamAudio);
      menu.querySelector('[data-action="hide-preview"] .nf318-check')?.classList.toggle('on',state.hidePreview);
      qa('[data-q]',menu).forEach(b=>b.classList.toggle('active',Number(b.dataset.q)===s.quality));
      qa('[data-fps]',menu).forEach(b=>b.classList.toggle('active',Number(b.dataset.fps)===s.fps));
    }
    m.classList.toggle('nf318-hide-preview',state.hidePreview);
  }

  // Mantém os controles internos como fonte de verdade, mas fora da interface principal.
  const oldChooseSource=window.chooseShareSource;
  if(typeof oldChooseSource==='function')window.chooseShareSource=function(){const r=oldChooseSource.apply(this,arguments);setTimeout(refreshUI,0);return r};
  const oldRender=window.renderShareSources;
  if(typeof oldRender==='function')window.renderShareSources=function(){const r=oldRender.apply(this,arguments);setTimeout(()=>{ensureBottom();refreshUI()},0);return r};
  const oldQ=window.chooseShareQuality;
  if(typeof oldQ==='function')window.chooseShareQuality=function(){const r=oldQ.apply(this,arguments);setTimeout(refreshUI,0);return r};
  const oldF=window.chooseShareFps;
  if(typeof oldF==='function')window.chooseShareFps=function(){const r=oldF.apply(this,arguments);setTimeout(refreshUI,0);return r};
  const oldOpen=window.openSharePicker;
  if(typeof oldOpen==='function')window.openSharePicker=async function(){const r=await oldOpen.apply(this,arguments);setTimeout(ensureBottom,25);setTimeout(ensureBottom,100);return r};

  document.addEventListener('click',e=>{
    const m=modal(); if(!m)return;
    const bottom=m.querySelector('.nf318-bottom'); if(!bottom)return;
    const menu=bottom.querySelector('.nf318-menu');
    if(menu?.classList.contains('show')&&!e.target.closest('.nf318-menu')&&!e.target.closest('.nf318-gear')){menu.classList.remove('show');bottom.querySelector('.nf318-gear')?.classList.remove('open');closeSubmenus(menu)}
  },true);

  const obs=new MutationObserver(()=>{if(modal()?.classList.contains('active'))requestAnimationFrame(ensureBottom)});
  if(modal())obs.observe(modal(),{attributes:true,attributeFilter:['class']});

  console.info('[Nuvem Fofa] v0.3.18 painel Discord de transmissão carregado');
})();
