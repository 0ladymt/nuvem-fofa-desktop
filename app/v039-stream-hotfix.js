// Nuvem Fofa v0.3.9 — hotfix definitivo do fullscreen e do submenu de qualidade
(() => {
  const $ = id => document.getElementById(id);

  const css = document.createElement('style');
  css.textContent = `
    /* O submenu precisa continuar inteiro dentro do viewport. */
    #nfShareQualitySub{
      position:fixed!important;
      z-index:2147483647!important;
      width:220px!important;
      max-height:calc(100vh - 20px)!important;
      overflow-y:auto!important;
      overscroll-behavior:contain!important;
    }
    #nfShareQualitySub::-webkit-scrollbar{width:8px}
    #nfShareQualitySub::-webkit-scrollbar-thumb{background:#4e5058;border-radius:8px}

    /* Fullscreen nativo do próprio vídeo. Não criar outro player nem mover o stream. */
    video.nf-native-fullscreen:fullscreen{
      width:100vw!important;
      height:100vh!important;
      max-width:none!important;
      max-height:none!important;
      object-fit:contain!important;
      background:#000!important;
      filter:none!important;
      transform:none!important;
    }
  `;
  document.head.appendChild(css);

  // Remove qualquer overlay de fullscreen legado que possa competir com o fullscreen nativo.
  function cleanupLegacyFullscreen(){
    const legacy=$('nfDiscordFullscreen');
    if(legacy){
      legacy.classList.remove('show');
      legacy.style.display='none';
      const lv=legacy.querySelector('video');
      if(lv) try{lv.srcObject=null}catch{}
    }
    try{window.nuvemDesktop?.setFullscreen?.(false)}catch{}
  }

  // Usa o Fullscreen API diretamente NO VÍDEO. Isso evita um segundo MediaStream e evita
  // mandar a BrowserWindow inteira para fullscreen, que era o que provocava tela preta,
  // atraso extremo e rastros do mouse quando a própria tela estava sendo compartilhada.
  window.fullscreenTile = async function(id){
    const tile=$(id), video=tile?.querySelector('video');
    if(!video?.srcObject){ if(typeof toast==='function')toast('Esta área não possui uma transmissão.'); return; }
    cleanupLegacyFullscreen();
    try{
      if(document.fullscreenElement) await document.exitFullscreen();
      video.classList.add('nf-native-fullscreen');
      await video.requestFullscreen({navigationUI:'hide'});
      try{await video.play()}catch{}
    }catch(err){
      video.classList.remove('nf-native-fullscreen');
      if(typeof toast==='function')toast('Não foi possível abrir a transmissão em tela cheia.');
    }
  };
  document.addEventListener('fullscreenchange',()=>{
    if(!document.fullscreenElement) document.querySelectorAll('video.nf-native-fullscreen').forEach(v=>v.classList.remove('nf-native-fullscreen'));
  });

  // Mantém o submenu do Discord inteiro visível ao lado do menu principal.
  function positionQualitySub(){
    const menu=$('nfDiscordShareMenu'), sub=$('nfShareQualitySub');
    if(!menu||!sub||!sub.classList.contains('show'))return;
    const quality=menu.querySelector('[data-act="quality"]');
    const mr=menu.getBoundingClientRect(), qr=quality?.getBoundingClientRect()||mr;
    // força a medição depois que está visível
    const sw=Math.max(220,sub.offsetWidth||220), sh=Math.min(sub.scrollHeight||430,innerHeight-20);
    let left=mr.right+8;
    if(left+sw>innerWidth-10) left=mr.left-sw-8;
    left=Math.max(10,Math.min(left,innerWidth-sw-10));
    let top=qr.top;
    if(top+sh>innerHeight-10) top=innerHeight-sh-10;
    top=Math.max(10,top);
    sub.style.left=left+'px';
    sub.style.right='auto';
    sub.style.top=top+'px';
    sub.style.bottom='auto';
  }

  // A v0.3.7 já cria 15/30/60 e 480/720/1080/1440; aqui garantimos que nenhuma opção
  // seja cortada visualmente e, por segurança, reconstituímos as ausentes caso necessário.
  function ensureAllQualityOptions(){
    const sub=$('nfShareQualitySub'); if(!sub)return;
    const existing=[...sub.querySelectorAll('[data-q]')].map(b=>Number(b.dataset.q));
    const widths={480:854,720:1280,1080:1920,1440:2560};
    for(const h of [480,720,1080,1440]){
      if(existing.includes(h))continue;
      const b=document.createElement('button');
      b.className='choice'; b.dataset.q=String(h); b.dataset.w=String(widths[h]); b.textContent=h+'p';
      sub.appendChild(b);
    }
    positionQualitySub();
  }

  const obs=new MutationObserver(()=>{
    const sub=$('nfShareQualitySub');
    if(sub?.classList.contains('show')) requestAnimationFrame(()=>{ensureAllQualityOptions();positionQualitySub()});
  });
  obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nfDiscordShareMenu [data-act="quality"]')){
      setTimeout(()=>{ensureAllQualityOptions();positionQualitySub()},0);
    }
  },true);
  window.addEventListener('resize',positionQualitySub);
})();
