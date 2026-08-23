// Nuvem Fofa v4.0.0 — núcleo de estabilização de voz/transmissão e layout
(()=>{'use strict';
const $=id=>document.getElementById(id),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
window.NF4={version:'4.0.0',streamAudio:true,userGain:new Map()};
const css=document.createElement('style');css.textContent=`
body.nf4 #voiceCallGrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-rows:minmax(220px,1fr)!important;gap:8px!important;align-content:stretch!important}
body.nf4 #voiceCallGrid .voice-tile,body.nf4 #voiceCallGrid .voice-panel{width:100%!important;height:100%!important;min-height:220px!important;aspect-ratio:16/9!important;max-height:none!important;border-radius:8px!important;overflow:hidden!important}
body.nf4 #voiceCallGrid video{width:100%!important;height:100%!important;object-fit:contain!important;background:#000!important}
@media(max-width:850px){body.nf4 #voiceCallGrid{grid-template-columns:1fr!important}}
`;document.head.appendChild(css);document.body.classList.add('nf4');
function audioEls(uid){return qa(`audio[id="voiceAudio-${uid}"],audio[id="voiceScreenAudio-${uid}"]`)}
function volume(uid){return clamp(Number(localStorage.getItem('nfUserVolume:'+uid)??1),0,2)}
function applyVolume(uid){const v=volume(uid),muted=localStorage.getItem('nfUserMuted:'+uid)==='1';audioEls(uid).forEach(a=>{a.muted=muted||!!window.voiceDeafened;if(v<=1){a.volume=v;disconnectGain(a)}else{a.volume=1;connectGain(a,v)}})}
function connectGain(a,v){try{let x=NF4.userGain.get(a);if(!x){const C=window.AudioContext||window.webkitAudioContext,ctx=window.__nf4AudioCtx||(window.__nf4AudioCtx=new C()),src=ctx.createMediaElementSource(a),gain=ctx.createGain();src.connect(gain);gain.connect(ctx.destination);x={ctx,gain};NF4.userGain.set(a,x)}x.gain.gain.setTargetAtTime(v,x.ctx.currentTime,.015);if(x.ctx.state==='suspended')x.ctx.resume().catch(()=>{})}catch(e){console.warn('[NF4] gain',e)}}
function disconnectGain(a){const x=NF4.userGain.get(a);if(x)try{x.gain.gain.setTargetAtTime(1,x.ctx.currentTime,.015)}catch{}}
function healAudio(){qa('audio[id^="voiceAudio-"],audio[id^="voiceScreenAudio-"]').forEach(a=>{const uid=a.id.replace(/^voice(?:Screen)?Audio-/,'');applyVolume(uid);if(a.srcObject&&a.paused)a.play().catch(()=>{});const ctx=window.__nf4AudioCtx;if(ctx?.state==='suspended')ctx.resume().catch(()=>{})})}
['pointerdown','keydown','click'].forEach(ev=>document.addEventListener(ev,()=>{window.__nf4AudioCtx?.resume?.().catch(()=>{});healAudio()},{capture:true,passive:true}));setInterval(healAudio,1500);
// Estado único para áudio da transmissão. UI e captura consultam a mesma fonte.
window.nf4SetStreamAudio=function(on){NF4.streamAudio=!!on;localStorage.setItem('nf4StreamAudio',on?'1':'0');try{if(window.localScreenStream){window.localScreenStream.getAudioTracks().forEach(t=>t.enabled=!!on)}}catch{};document.dispatchEvent(new CustomEvent('nf4-stream-audio',{detail:{enabled:!!on}}));return !!on};
NF4.streamAudio=localStorage.getItem('nf4StreamAudio')!=='0';
function syncShareAudioUI(){qa('[data-share-audio],#shareAudioToggle,.nf-share-audio').forEach(el=>{if('checked'in el)el.checked=NF4.streamAudio;el.classList.toggle('on',NF4.streamAudio);el.setAttribute('aria-checked',String(NF4.streamAudio))})}
document.addEventListener('nf4-stream-audio',syncShareAudioUI);setInterval(syncShareAudioUI,1000);
// Não permite que a chegada de uma faixa de tela destrua a faixa de voz existente.
function safeTrack(uid,e){const track=e.track;if(!track)return;if(track.kind==='audio'){const stream=new MediaStream([track]),hasVideo=(e.streams||[]).some(s=>s.getVideoTracks().length);let id=(hasVideo?'voiceScreenAudio-':'voiceAudio-')+uid,a=$(id);if(!a){a=document.createElement('audio');a.id=id;a.autoplay=true;a.playsInline=true;a.style.display='none';document.body.appendChild(a)}a.srcObject=stream;applyVolume(uid);a.play().catch(()=>{})}}
const oldCreate=window.createPeer;if(typeof oldCreate==='function')window.createPeer=async function(uid){const pc=await oldCreate.apply(this,arguments);if(pc&&!pc.__nf4){pc.__nf4=true;const prev=pc.ontrack;pc.ontrack=e=>{try{prev?.call(pc,e)}finally{safeTrack(uid,e);setTimeout(()=>applyVolume(uid),0)}}}return pc};
// Recuperação de mídia quando o app volta do background ou muda o estado da transmissão.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(healAudio,50)});window.addEventListener('focus',()=>setTimeout(healAudio,50));
console.info('[Nuvem Fofa] v4.0.0 core carregado — implementação requer validação em call real');
})();
