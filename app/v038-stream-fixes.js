// Nuvem Fofa v0.3.8 — fullscreen sem duplicar MediaStream e menu de qualidade completo
(() => {
  const $ = id => document.getElementById(id);

  const css = document.createElement('style');
  css.textContent = `
    #nfDiscordFullscreen{position:fixed;inset:0;background:#000!important;z-index:2147483640;display:none;overflow:hidden}
    #nfDiscordFullscreen.show{display:block!important}
    #nfDiscordFullscreen .nf-fs-stage{position:absolute;inset:0;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden}
    #nfDiscordFullscreen .nf-fs-stage video{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;background:#000!important;filter:none!important;transform:none!important}
    #nfDiscordFullscreen .fs-title{position:fixed;left:16px;top:14px;z-index:5;background:#111a;color:#fff;padding:6px 9px;border-radius:6px;font-size:13px;font-weight:700;pointer-events:none}
    #nfDiscordFullscreen .fs-exit{position:fixed;right:16px;bottom:16px;z-index:5;width:44px;height:44px;border:0;border-radius:8px;background:#1e1f22e6;color:#fff;cursor:pointer}
    #nfDiscordShareMenu .sub{max-height:min(560px,calc(100vh - 24px));overflow-y:auto}
  `;
  document.head.appendChild(css);

  // Não ligamos o mesmo MediaStream a um segundo <video>. Em Electron/Chromium isso pode
  // deixar a captura da própria janela preta/travada. O vídeo original é movido para o palco
  // fullscreen e depois devolvido exatamente ao lugar de onde saiu.
  let fsState = null;
  function ensureFs38(){
    let box = $('nfDiscordFullscreen');
    if(!box){ box=document.createElement('div'); box.id='nfDiscordFullscreen'; document.body.appendChild(box); }
    box.innerHTML='<div class="fs-title">Transmissão</div><div class="nf-fs-stage"></div><button class="fs-exit" title="Sair da tela cheia">⛶</button>';
    box.querySelector('.fs-exit').onclick=closeFs38;
    return box;
  }
  async function closeFs38(){
    const box=$('nfDiscordFullscreen');
    if(fsState?.video && fsState?.parent){
      try{ fsState.placeholder.replaceWith(fsState.video); }catch{ try{fsState.parent.appendChild(fsState.video)}catch{} }
      fsState.video.style.cssText=fsState.style||'';
      try{await fsState.video.play()}catch{}
    }
    fsState=null;
    box?.classList.remove('show');
    try{await window.nuvemDesktop?.setFullscreen?.(false)}catch{}
  }
  window.fullscreenTile = async function(id){
    const tile=$(id);
    const src=tile?.querySelector('video');
    if(!src || !src.srcObject) return typeof toast==='function'&&toast('Esta área não possui uma transmissão.');
    if(fsState) await closeFs38();
    const box=ensureFs38(), stage=box.querySelector('.nf-fs-stage');
    const placeholder=document.createComment('nf-fullscreen-video');
    src.parentNode.insertBefore(placeholder,src);
    fsState={video:src,parent:src.parentNode,placeholder,style:src.style.cssText};
    stage.appendChild(src);
    src.style.cssText='width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;background:#000!important;filter:none!important;transform:none!important;';
    box.classList.add('show');
    try{await window.nuvemDesktop?.setFullscreen?.(true)}catch{}
    try{await src.play()}catch{}
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('nfDiscordFullscreen')?.classList.contains('show')){e.preventDefault();e.stopImmediatePropagation();closeFs38()}},true);

  // Submenu de qualidade: sempre mostra todas as opções, sem corte vertical.
  function installQualityMenuPatch(){
    const old=window.showDiscordShareMenu;
    // A função da v0.3.7 é lexical; portanto interceptamos o submenu depois que ele abre.
    document.addEventListener('click',()=>{
      setTimeout(()=>{
        const menu=$('nfDiscordShareMenu'), sub=$('nfShareQualitySub');
        if(!menu||!sub)return;
        const labels=[...sub.querySelectorAll('button')].map(b=>b.textContent.trim());
        const s=window.nfShareSettings||{height:1080,width:1920,fps:60};
        const missing=[480,720,1080,1440].filter(h=>!labels.includes(h+'p'));
        for(const h of missing){
          const b=document.createElement('button'); b.className='choice'+(s.height===h?' active':''); b.dataset.q=h; b.dataset.w=({480:854,720:1280,1080:1920,1440:2560})[h]; b.textContent=h+'p'; sub.appendChild(b);
        }
        // posiciona o submenu inteiro dentro da tela para 480/720/1080/1440 ficarem visíveis
        if(sub.classList.contains('show')){
          const mr=menu.getBoundingClientRect();
          sub.style.top=Math.max(0,Math.min(0,innerHeight-sub.scrollHeight-12))+'px';
          sub.style.left=(mr.right+230<innerWidth?'100%':'auto');
          sub.style.right=(mr.right+230<innerWidth?'auto':'100%');
        }
      },0);
    },true);
  }
  installQualityMenuPatch();
})();
