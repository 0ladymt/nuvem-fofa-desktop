// Nuvem Fofa v0.3.16 — imagens do servidor + UI estável da transmissão
(() => {
  const $=id=>document.getElementById(id);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];

  const css=document.createElement('style');
  css.textContent=`
    /* O crop deve SEMPRE ficar acima de configurações de perfil/servidor. */
    #serverSettingsModal{z-index:10020!important}
    #profileModal{z-index:10020!important}
    #cropModal{z-index:10080!important}
    #cropModal.active{display:flex!important;pointer-events:auto!important}
    #cropModal .modal-card{position:relative!important;z-index:10081!important;box-shadow:0 24px 90px rgba(0,0,0,.72)!important}

    /* Preview das imagens do servidor, sem filtros ou mistura de cor. */
    #serverIconPreview,#serverCoverPreview{filter:none!important;-webkit-filter:none!important;mix-blend-mode:normal!important;opacity:1!important;background-repeat:no-repeat!important;background-position:center!important;background-size:cover!important}

    /* Seletor de transmissão: composição visual próxima do Discord, sem alterar a lógica. */
    #sharePickerModal{background:rgba(0,0,0,.72)!important;backdrop-filter:blur(3px)!important}
    #sharePickerModal .share-picker-card{width:min(900px,94vw)!important;max-height:min(760px,90vh)!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;background:#18191c!important;border:1px solid #303238!important;border-radius:14px!important;box-shadow:0 26px 80px rgba(0,0,0,.7)!important}
    #sharePickerModal .modal-head{display:none!important}
    #sharePickerModal .share-tabs{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:4px!important;padding:5px!important;margin:0!important;background:#101114!important;border-bottom:1px solid #292b30!important;flex:0 0 auto!important}
    #sharePickerModal .share-tabs button{height:43px!important;border:0!important;border-radius:9px!important;background:transparent!important;color:#b5bac1!important;font-size:13px!important;font-weight:700!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;cursor:pointer!important}
    #sharePickerModal .share-tabs button:hover{background:#202226!important;color:#fff!important}
    #sharePickerModal .share-tabs button.active{background:#2b2d31!important;color:#fff!important}
    #sharePickerModal .share-sources{flex:1 1 auto!important;min-height:260px!important;max-height:420px!important;overflow:auto!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;align-content:start!important;gap:12px!important;padding:16px!important;background:#18191c!important}
    #sharePickerModal .share-source{min-width:0!important;border:2px solid transparent!important;border-radius:10px!important;background:#232428!important;padding:7px!important;color:#f2f3f5!important;text-align:left!important;cursor:pointer!important;transition:background .12s,border-color .12s!important}
    #sharePickerModal .share-source:hover{background:#2b2d31!important;border-color:#44474f!important}
    #sharePickerModal .share-source.active,#sharePickerModal .share-source.selected{border-color:#5865f2!important;background:#2b2d31!important}
    #sharePickerModal .share-source img{display:block!important;width:100%!important;aspect-ratio:16/9!important;object-fit:cover!important;margin:0 0 7px!important;border-radius:7px!important;background:#0d0e10!important;filter:none!important}
    #sharePickerModal .share-source-name,#sharePickerModal .share-source .name,#sharePickerModal .share-source b{font-size:13px!important;font-weight:700!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #sharePickerModal .share-options{display:grid!important;grid-template-columns:1fr 1fr!important;gap:13px 22px!important;padding:13px 16px 8px!important;background:#18191c!important;border-top:1px solid #292b30!important;flex:0 0 auto!important}
    #sharePickerModal .share-options>div label{display:block!important;margin:0 0 7px!important;color:#949ba4!important;font-size:11px!important;font-weight:800!important;text-transform:uppercase!important}
    #sharePickerModal .share-choice-row{display:flex!important;gap:7px!important}
    #sharePickerModal .share-choice-row button{height:37px!important;min-width:70px!important;padding:0 12px!important;border:1px solid #3f4147!important;border-radius:7px!important;background:#232428!important;color:#dbdee1!important;cursor:pointer!important}
    #sharePickerModal .share-choice-row button:hover{background:#35373c!important}
    #sharePickerModal .share-choice-row button.active{background:#5865f2!important;border-color:#5865f2!important;color:#fff!important}
    #sharePickerModal .share-audio-toggle{grid-column:1/-1!important;display:flex!important;align-items:center!important;gap:9px!important;padding:1px 0 5px!important;color:#dbdee1!important;font-size:13px!important;font-weight:600!important}
    #sharePickerModal .share-audio-toggle input{width:17px!important;height:17px!important;accent-color:#5865f2!important}
    #sharePickerModal .modal-actions{display:flex!important;justify-content:flex-end!important;gap:8px!important;padding:8px 16px 14px!important;background:#18191c!important;border:0!important;flex:0 0 auto!important}
    #sharePickerModal .modal-actions button{height:40px!important;border-radius:7px!important;padding:0 16px!important}
    #sharePickerModal .nf316-stream-footer{display:flex!important;align-items:center!important;gap:12px!important;padding:10px 13px!important;background:#101114!important;border-top:1px solid #292b30!important;flex:0 0 auto!important}
    #sharePickerModal .nf316-stream-copy{flex:1;min-width:0}.nf316-stream-copy b{display:block;color:#f2f3f5;font-size:13px}.nf316-stream-copy small{display:block;color:#949ba4;font-size:11px;margin-top:2px}
    #sharePickerModal .nf316-stream-gear{width:38px!important;height:38px!important;border:0!important;border-radius:8px!important;background:#232428!important;color:#dbdee1!important;display:grid!important;place-items:center!important;cursor:pointer!important;font-size:18px!important}
    #sharePickerModal .nf316-stream-gear:hover{background:#35373c!important;color:#fff!important}
    @media(max-width:720px){#sharePickerModal .share-sources{grid-template-columns:1fr!important}#sharePickerModal .share-options{grid-template-columns:1fr!important}#sharePickerModal .share-audio-toggle{grid-column:1!important}}
  `;
  document.head.appendChild(css);

  function refreshServerPreview(){
    if(!window.cropState) return;
  }

  // Depois de aplicar uma imagem do servidor, volta ao painel mantendo a prévia imediatamente visível.
  const previousApply=window.applyCrop;
  window.applyCrop=function(){
    const type=window.cropState?.type;
    const result=previousApply?.apply(this,arguments);
    if(type==='serverIcon'||type==='serverBanner'){
      setTimeout(()=>{
        const modal=$('serverSettingsModal');
        if(modal&&!modal.classList.contains('active')) modal.classList.add('active');
        const icon=$('serverIconPreview');
        if(type==='serverIcon'&&icon&&window.pendingServerIcon){
          icon.style.backgroundImage=`url("${window.pendingServerIcon}")`;
          icon.style.backgroundSize='cover';icon.style.backgroundPosition='center';icon.textContent='';
        }
        const cover=$('serverCoverPreview');
        if(type==='serverBanner'&&cover&&window.pendingServerCover){
          cover.style.backgroundImage=`url("${window.pendingServerCover}")`;
          cover.style.backgroundSize='cover';cover.style.backgroundPosition='center';
        }
      },0);
    }
    return result;
  };

  const gearSvg='<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.7 2.1-1.6-.5a8 8 0 0 0-.7-1.6l.8-1.5-2.2-2.2-1.5.8a8 8 0 0 0-1.6-.7L13.4 3h-2.8l-.5 1.9a8 8 0 0 0-1.6.7L7 4.8 4.8 7l.8 1.5a8 8 0 0 0-.7 1.6l-1.9.5v2.8l1.9.5c.2.6.4 1.1.7 1.6L4.8 17 7 19.2l1.5-.8c.5.3 1 .5 1.6.7l.5 1.9h2.8l.5-1.9c.6-.2 1.1-.4 1.6-.7l1.5.8 2.2-2.2-.8-1.5c.3-.5.5-1 .7-1.6l1.6-.5v-2.8Z"/></svg>';

  function streamSummary(){
    const s=window.sharePickerState||{};
    const q=s.quality||1080, fps=s.fps||60;
    return `Vídeo mais suave · ${q}p · ${fps}fps`;
  }
  function refreshFooter(){
    const copy=$('sharePickerModal')?.querySelector('.nf316-stream-copy');
    if(copy) copy.innerHTML=`<b>Jogos</b><small>${streamSummary()}</small>`;
  }
  function polishSharePicker(){
    const modal=$('sharePickerModal'), card=modal?.querySelector('.share-picker-card');
    if(!modal||!card) return;
    // Não recria o seletor; só organiza os elementos que a lógica original já criou.
    let footer=card.querySelector('.nf316-stream-footer');
    if(!footer){
      footer=document.createElement('div');footer.className='nf316-stream-footer';
      footer.innerHTML=`<div class="nf316-stream-copy"></div><button class="nf316-stream-gear" type="button" title="Configurações da transmissão">${gearSvg}</button>`;
      card.appendChild(footer);
      footer.querySelector('.nf316-stream-gear').onclick=()=>{
        const existing=card.querySelector('.nf-stream-gear');
        if(existing) existing.click();
        else toast('As opções avançadas continuam disponíveis pelos controles de qualidade e FPS acima.');
      };
    }
    refreshFooter();
  }

  const previousOpenShare=window.openSharePicker;
  if(typeof previousOpenShare==='function'){
    window.openSharePicker=async function(){
      const r=await previousOpenShare.apply(this,arguments);
      // Uma única organização após o modal estar pronto; sem MutationObserver.
      setTimeout(polishSharePicker,25);
      return r;
    };
  }
  const previousQ=window.chooseShareQuality;
  if(typeof previousQ==='function') window.chooseShareQuality=function(){const r=previousQ.apply(this,arguments);refreshFooter();return r};
  const previousF=window.chooseShareFps;
  if(typeof previousF==='function') window.chooseShareFps=function(){const r=previousF.apply(this,arguments);refreshFooter();return r};

  console.info('[Nuvem Fofa] v0.3.16 servidor/imagens + UI transmissão carregado');
})();
