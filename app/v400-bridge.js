// Nuvem Fofa V4 — ponte controlada para elementos antigos ainda usados pela UI aprovada
(()=>{'use strict';
// O slider antigo tentava atribuir 2.0 diretamente a HTMLMediaElement.volume (que só aceita 0..1).
// Capturamos antes do handler legado e aplicamos o ganho WebAudio da V4.
document.addEventListener('input',e=>{
  const r=e.target?.closest?.('.nf-user-context input[data-a="volume"]');
  if(!r)return;
  e.stopImmediatePropagation();
  const menu=r.closest('.nf-user-context');
  const uid=menu?.dataset?.nf4Uid||window.__nf4ContextUid;
  if(!uid)return;
  const v=Math.max(0,Math.min(2,Number(r.value)||0));
  localStorage.setItem('nfUserVolume:'+uid,String(v));
  window.nf4ApplyUserVolume?.(uid);
},true);

// Descobre qual usuário pertence ao menu de contexto a partir do elemento que o abriu.
document.addEventListener('contextmenu',e=>{
  const target=e.target?.closest?.('[data-voice-user]');
  if(target?.dataset?.voiceUser)window.__nf4ContextUid=target.dataset.voiceUser;
},true);

// A engrenagem 0.3.18 continua sendo o visual aprovado. O clique agora altera também a track real.
document.addEventListener('click',e=>{
  if(e.target?.closest?.('#sharePickerModal [data-action="mute"]')){
    setTimeout(()=>{
      const old=window.nf318StreamState;
      if(old)window.nf4SetStreamAudio?.(!old.muteStreamAudio);
    },0);
  }
},true);

// Quando o menu de compartilhamento abre, todas as superfícies partem do mesmo estado.
document.addEventListener('click',e=>{
  if(e.target?.closest?.('#voiceShareBtn,.nf318-gear'))setTimeout(()=>{
    const old=window.nf318StreamState;
    if(old)old.muteStreamAudio=!(window.NF4?.streamAudio!==false);
    const input=document.getElementById('shareAudioToggle');if(input)input.checked=window.NF4?.streamAudio!==false;
  },30);
},true);

console.info('[Nuvem Fofa] V4 bridge carregada');
})();
