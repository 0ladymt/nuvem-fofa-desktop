// Nuvem Fofa v0.3.19 — corrige controles do painel de transmissão e restaura barra do usuário
(() => {
  const $ = id => document.getElementById(id);
  const qa = (s,r=document)=>[...r.querySelectorAll(s)];
  const picker = () => $('sharePickerModal');

  const mirror = window.nf319ShareMirror = window.nf319ShareMirror || {
    quality:1080,
    fps:60,
    sourceId:null
  };

  function getNativeQualityButton(q){
    const m=picker();
    return m ? qa('#shareQualityChoices button',m).find(b=>Number(b.dataset.value)===Number(q)) : null;
  }
  function getNativeFpsButton(fps){
    const m=picker();
    return m ? qa('#shareFpsChoices button',m).find(b=>Number(b.dataset.value)===Number(fps)) : null;
  }

  function applyResolution(q){
    mirror.quality=Number(q);
    const b=getNativeQualityButton(q);
    if(b && typeof window.chooseShareQuality==='function') window.chooseShareQuality(Number(q),b);
    syncShareUi();
  }
  function applyFps(fps){
    mirror.fps=Number(fps);
    const b=getNativeFpsButton(fps);
    if(b && typeof window.chooseShareFps==='function') window.chooseShareFps(Number(fps),b);
    syncShareUi();
  }

  function sourceIsSelected(){
    const m=picker();
    if(!m)return false;
    const selected=m.querySelector('.share-source.active,.share-source.selected');
    if(selected)return true;
    return !!mirror.sourceId;
  }

  function syncShareUi(){
    const m=picker(); if(!m)return;
    const bottom=m.querySelector('.nf318-bottom'); if(!bottom)return;

    qa('.nf318-choice[data-q]',bottom).forEach(b=>b.classList.toggle('active',Number(b.dataset.q)===mirror.quality));
    qa('.nf318-choice[data-fps]',bottom).forEach(b=>b.classList.toggle('active',Number(b.dataset.fps)===mirror.fps));

    const mode=bottom.querySelector('.nf318-mode small');
    if(mode) mode.textContent=`Vídeo mais suave · ${mirror.quality}p · ${mirror.fps}fps`;
    const gameSummary=bottom.querySelector('.nf318-games-summary');
    if(gameSummary) gameSummary.textContent=`Vídeo mais suave (${mirror.quality}p, ${mirror.fps}fps)`;

    const start=bottom.querySelector('.nf318-start');
    if(start) start.disabled=!sourceIsSelected();
  }

  // Intercepta apenas os botões do submenu novo. Evita o refresh da v0.3.18
  // sobrescrever visualmente a escolha com valores antigos.
  document.addEventListener('click',e=>{
    const q=e.target.closest?.('#sharePickerModal .nf318-choice[data-q]');
    if(q){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      const state=window.nf318StreamState;if(state)state.mode='custom';
      applyResolution(Number(q.dataset.q));
      return;
    }
    const f=e.target.closest?.('#sharePickerModal .nf318-choice[data-fps]');
    if(f){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      const state=window.nf318StreamState;if(state)state.mode='custom';
      applyFps(Number(f.dataset.fps));
      return;
    }
  },true);

  // Espelha a fonte escolhida. A função original continua sendo a responsável
  // por atualizar o estado real usado por startSelectedShare().
  const oldChooseSource=window.chooseShareSource;
  if(typeof oldChooseSource==='function'){
    window.chooseShareSource=function(id){
      mirror.sourceId=id||null;
      const r=oldChooseSource.apply(this,arguments);
      setTimeout(syncShareUi,0);setTimeout(syncShareUi,40);
      return r;
    };
  }

  const oldQ=window.chooseShareQuality;
  if(typeof oldQ==='function'){
    window.chooseShareQuality=function(v,btn){
      mirror.quality=Number(v)||1080;
      const r=oldQ.apply(this,arguments);
      setTimeout(syncShareUi,0);
      return r;
    };
  }
  const oldF=window.chooseShareFps;
  if(typeof oldF==='function'){
    window.chooseShareFps=function(v,btn){
      mirror.fps=Number(v)||60;
      const r=oldF.apply(this,arguments);
      setTimeout(syncShareUi,0);
      return r;
    };
  }

  const oldOpen=window.openSharePicker;
  if(typeof oldOpen==='function'){
    window.openSharePicker=async function(){
      mirror.sourceId=null;
      const r=await oldOpen.apply(this,arguments);
      setTimeout(()=>{
        const aq=picker()?.querySelector('#shareQualityChoices button.active');
        const af=picker()?.querySelector('#shareFpsChoices button.active');
        if(aq)mirror.quality=Number(aq.dataset.value)||1080;
        if(af)mirror.fps=Number(af.dataset.value)||60;
        syncShareUi();
      },100);
      return r;
    };
  }

  // O botão novo chama diretamente a função real da transmissão e só fica
  // habilitado quando uma fonte realmente foi selecionada.
  document.addEventListener('click',e=>{
    const start=e.target.closest?.('#sharePickerModal .nf318-start');
    if(!start)return;
    e.preventDefault();e.stopPropagation();
    if(!sourceIsSelected())return;
    window.startSelectedShare?.();
  },true);

  // Mudanças de classe dos cards acontecem após renderização; sincroniza o botão.
  const m=picker();
  if(m){
    const obs=new MutationObserver(()=>{
      if(m.classList.contains('active'))requestAnimationFrame(syncShareUi);
    });
    obs.observe(m,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }

  // ----- Barra inferior do usuário -----
  let userbarBackup=null;
  function captureUserbar(){
    const bar=$('meUserbar');
    if(bar&&!userbarBackup)userbarBackup=bar.cloneNode(true);
  }
  function restoreUserbar(){
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar)return;
    let bar=$('meUserbar');
    if(!bar&&userbarBackup){
      bar=userbarBackup.cloneNode(true);
      sidebar.appendChild(bar);
    }
    if(!bar)return;
    bar.classList.remove('hidden');
    bar.style.removeProperty('display');
    bar.style.removeProperty('visibility');
    bar.style.removeProperty('opacity');
    if(getComputedStyle(bar).display==='none')bar.style.setProperty('display','flex','important');
    // Repõe conteúdo visual caso algum hotfix anterior o tenha esvaziado.
    const avatar=bar.querySelector('#meAvatar');
    const name=bar.querySelector('#meName');
    const status=bar.querySelector('#meStatus');
    try{
      if(avatar&&window.currentUserData)avatar.src=window.imgFor?.(window.currentUserData)||window.currentUserData.avatar||avatar.src;
      if(name&&window.currentUserData)name.textContent=window.currentUserData.username||'Usuário';
      if(status&&window.currentUserData)status.textContent=window.presenceLabel?.(window.currentUserData.presenceMode||'online')||'Disponível';
    }catch{}
  }

  captureUserbar();
  setTimeout(captureUserbar,500);

  const oldLeave=window.leaveVoiceChannel;
  if(typeof oldLeave==='function'){
    window.leaveVoiceChannel=async function(){
      const r=await oldLeave.apply(this,arguments);
      setTimeout(restoreUserbar,0);setTimeout(restoreUserbar,100);setTimeout(restoreUserbar,350);
      return r;
    };
  }

  // Segurança extra: ao desaparecer o painel de voz, a barra normal deve permanecer.
  const bodyObs=new MutationObserver(()=>{
    if(!$('voicePanel'))restoreUserbar();
  });
  bodyObs.observe(document.body,{childList:true,subtree:true});

  console.info('[Nuvem Fofa] v0.3.19 controles de transmissão + barra do usuário corrigidos');
})();
