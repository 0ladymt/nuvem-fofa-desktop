// Nuvem Fofa v0.3.17 — unifica o seletor de transmissão sem alterar a captura
(() => {
  const $=id=>document.getElementById(id);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];

  const css=document.createElement('style');
  css.textContent=`
    /* A v0.3.10 já cria a navegação estilo Discord. Esconde a navegação nativa antiga. */
    #sharePickerModal .share-tabs{display:none!important}

    /* Esconde os rodapés redundantes criados por versões posteriores. */
    #sharePickerModal .nf-stream-modebar,
    #sharePickerModal .nf316-stream-footer{display:none!important}

    /* Estrutura única do painel. */
    #sharePickerModal{background:rgba(0,0,0,.76)!important;backdrop-filter:blur(5px)!important}
    #sharePickerModal .share-picker-card,
    #sharePickerModal .nf-discord-share-shell{
      width:min(920px,94vw)!important;
      max-height:min(760px,90vh)!important;
      background:#18191c!important;
      border:1px solid #2f3136!important;
      border-radius:14px!important;
      overflow:hidden!important;
      display:flex!important;
      flex-direction:column!important;
      box-shadow:0 28px 90px rgba(0,0,0,.72)!important;
    }
    #sharePickerModal .modal-head{display:none!important}
    #sharePickerModal .modal-body{
      padding:0!important;
      background:#18191c!important;
      overflow:auto!important;
      min-height:0!important;
    }

    /* ÚNICA barra superior — a criada pela v0.3.10. */
    #sharePickerModal .nf-discord-picker-head{
      display:grid!important;
      grid-template-columns:repeat(3,1fr)!important;
      gap:4px!important;
      padding:5px!important;
      margin:0!important;
      background:#101114!important;
      border-bottom:1px solid #292b30!important;
      border-radius:0!important;
      position:sticky!important;
      top:0!important;
      z-index:8!important;
    }
    #sharePickerModal .nf-discord-picker-tab{
      height:44px!important;
      padding:0 14px!important;
      border:0!important;
      border-radius:9px!important;
      background:transparent!important;
      color:#b5bac1!important;
      font-size:13px!important;
      font-weight:700!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      gap:8px!important;
      cursor:pointer!important;
    }
    #sharePickerModal .nf-discord-picker-tab:hover{background:#202226!important;color:#fff!important}
    #sharePickerModal .nf-discord-picker-tab.active{background:#2b2d31!important;color:#fff!important}
    #sharePickerModal .nf-discord-picker-tab svg{width:17px!important;height:17px!important;fill:currentColor!important}

    /* Fontes em cards grandes, sem espremer a miniatura. */
    #sharePickerModal .share-sources{
      display:grid!important;
      grid-template-columns:repeat(2,minmax(0,1fr))!important;
      align-content:start!important;
      gap:14px!important;
      padding:18px!important;
      min-height:250px!important;
      max-height:390px!important;
      overflow:auto!important;
      background:#18191c!important;
    }
    #sharePickerModal .share-source{
      min-width:0!important;
      padding:8px!important;
      border:2px solid transparent!important;
      border-radius:10px!important;
      background:#232428!important;
      color:#f2f3f5!important;
      overflow:hidden!important;
      cursor:pointer!important;
    }
    #sharePickerModal .share-source:hover{background:#2b2d31!important;border-color:#4e5058!important}
    #sharePickerModal .share-source.active,
    #sharePickerModal .share-source.selected{background:#2b2d31!important;border-color:#5865f2!important}
    #sharePickerModal .share-source img{
      width:100%!important;
      height:auto!important;
      aspect-ratio:16/9!important;
      object-fit:cover!important;
      display:block!important;
      margin:0!important;
      border-radius:7px!important;
      background:#0d0e10!important;
      filter:none!important;
      -webkit-filter:none!important;
      mix-blend-mode:normal!important;
    }
    #sharePickerModal .share-source .name,
    #sharePickerModal .share-source-name,
    #sharePickerModal .share-source b{
      display:block!important;
      margin:8px 2px 1px!important;
      font-size:13px!important;
      font-weight:700!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
    }

    /* Qualidade/FPS em uma única faixa limpa. */
    #sharePickerModal .share-options{
      display:grid!important;
      grid-template-columns:1fr 1fr!important;
      gap:12px 28px!important;
      padding:14px 18px 8px!important;
      background:#18191c!important;
      border-top:1px solid #292b30!important;
    }
    #sharePickerModal .share-options>div label{
      display:block!important;
      margin:0 0 7px!important;
      color:#949ba4!important;
      font-size:11px!important;
      font-weight:800!important;
      text-transform:uppercase!important;
    }
    #sharePickerModal .share-choice-row{display:flex!important;gap:7px!important;flex-wrap:wrap!important}
    #sharePickerModal .share-choice-row button{
      min-width:72px!important;
      height:38px!important;
      padding:0 13px!important;
      border:1px solid #3f4147!important;
      border-radius:7px!important;
      background:#232428!important;
      color:#dbdee1!important;
      cursor:pointer!important;
    }
    #sharePickerModal .share-choice-row button:hover{background:#35373c!important}
    #sharePickerModal .share-choice-row button.active{background:#5865f2!important;border-color:#5865f2!important;color:#fff!important}
    #sharePickerModal .share-audio-toggle{
      grid-column:1/-1!important;
      display:flex!important;
      align-items:center!important;
      gap:9px!important;
      padding:2px 0 6px!important;
      color:#dbdee1!important;
      font-size:13px!important;
      font-weight:600!important;
    }
    #sharePickerModal .share-audio-toggle input{width:17px!important;height:17px!important;accent-color:#5865f2!important}

    #sharePickerModal .modal-actions{
      display:flex!important;
      justify-content:flex-end!important;
      gap:8px!important;
      padding:8px 18px 14px!important;
      background:#18191c!important;
      border:0!important;
    }
    #sharePickerModal .modal-actions button{height:40px!important;padding:0 16px!important;border-radius:7px!important}

    /* ÚNICO rodapé: o da v0.3.10. */
    #sharePickerModal .nf-discord-bottom{
      display:flex!important;
      align-items:center!important;
      gap:12px!important;
      margin:0!important;
      padding:11px 14px!important;
      border-top:1px solid #292b30!important;
      background:#101114!important;
    }
    #sharePickerModal .nf-discord-bottom .mode{min-width:0!important;flex:1!important}
    #sharePickerModal .nf-discord-bottom .mode b{display:block!important;font-size:13px!important;color:#f2f3f5!important;margin:0!important}
    #sharePickerModal .nf-discord-bottom .mode small{display:block!important;margin-top:2px!important;color:#949ba4!important;font-size:11px!important}
    #sharePickerModal .nf-discord-gear{
      width:40px!important;height:40px!important;border:0!important;border-radius:8px!important;
      background:#232428!important;color:#dbdee1!important;display:grid!important;place-items:center!important;cursor:pointer!important
    }
    #sharePickerModal .nf-discord-gear:hover{background:#35373c!important;color:#fff!important}

    @media(max-width:720px){
      #sharePickerModal .share-sources{grid-template-columns:1fr!important}
      #sharePickerModal .share-options{grid-template-columns:1fr!important}
      #sharePickerModal .share-audio-toggle{grid-column:1!important}
    }
  `;
  document.head.appendChild(css);

  function cleanPicker(){
    const modal=$('sharePickerModal');
    if(!modal) return;

    // A v0.3.10 é a navegação que deve permanecer.
    const customHeads=qa('.nf-discord-picker-head',modal);
    customHeads.slice(1).forEach(el=>el.remove());

    // Mantém somente um rodapé Discord e oculta/removemos complementos redundantes.
    const bottoms=qa('.nf-discord-bottom',modal);
    bottoms.slice(1).forEach(el=>el.remove());
    qa('.nf316-stream-footer',modal).forEach(el=>el.remove());
    // Não removemos nf-stream-modebar porque o observer antigo recriaria; CSS o mantém invisível.

    // A barra nativa precisa existir para a lógica de clique da v0.3.10, mas fica invisível.
    qa('.share-tabs',modal).forEach(el=>{
      el.setAttribute('aria-hidden','true');
      el.style.setProperty('display','none','important');
    });
  }

  const baseOpen=window.openSharePicker;
  if(typeof baseOpen==='function'){
    window.openSharePicker=async function(){
      const r=await baseOpen.apply(this,arguments);
      setTimeout(cleanPicker,20);
      setTimeout(cleanPicker,90);
      return r;
    };
  }

  // Limpeza pontual quando o modal é aberto. Não observa a página inteira e não toca na captura.
  const modal=$('sharePickerModal');
  if(modal){
    const obs=new MutationObserver(()=>{
      if(modal.classList.contains('active')) requestAnimationFrame(cleanPicker);
    });
    obs.observe(modal,{attributes:true,attributeFilter:['class']});
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#sharePickerModal')) setTimeout(cleanPicker,0);
  },true);

  console.info('[Nuvem Fofa] v0.3.17 seletor de transmissão unificado');
})();
