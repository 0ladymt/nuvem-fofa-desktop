// Nuvem Fofa v4.0.0 — núcleo consolidado de voz, transmissão e estabilidade
(()=>{'use strict';
const $=id=>document.getElementById(id),qa=(s,r=document)=>[...r.querySelectorAll(s)],clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
window.NF4=window.NF4||{};Object.assign(NF4,{version:'4.0.0',streamAudio:localStorage.getItem('nf4StreamAudio')!=='0',userGain:NF4.userGain||new Map(),peerRecovery:new Map()});
const css=document.createElement('style');css.textContent=`
body.nf4 #voiceCallGrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-rows:minmax(210px,1fr)!important;gap:8px!important;align-content:stretch!important;padding:8px!important}
body.nf4 #voiceCallGrid .voice-tile,body.nf4 #voiceCallGrid>div{width:100%!important;min-width:0!important;min-height:210px!important;aspect-ratio:16/9!important;max-height:none!important;border-radius:8px!important;overflow:hidden!important}
body.nf4 #voiceCallGrid video{width:100%!important;height:100%!important;object-fit:contain!important;background:#000!important}
body.nf4 .voice-call-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
@media(max-width:850px){body.nf4 #voiceCallGrid,body.nf4 .voice-call-grid{grid-template-columns:1fr!important}}
`;document.head.appendChild(css);document.body.classList.add('nf4');
function uidFromAudio(a){return a.id.replace(/^voice(?:Screen)?Audio-/,'')}
function audioEls(uid){return qa(`audio[id="voiceAudio-${uid}"],audio[id="voiceScreenAudio-${uid}"]`)}
function storedVolume(uid){return clamp(Number(localStorage.getItem('nfUserVolume:'+uid)??1),0,2)}
function ensureCtx(){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;return window.__nf4AudioCtx||(window.__nf4AudioCtx=new C({latencyHint:'interactive'}))}
function gainFor(a){let x=NF4.userGain.get(a);if(x)return x;try{const ctx=ensureCtx();if(!ctx)return null;const src=ctx.createMediaElementSource(a),gain=ctx.createGain();src.connect(gain).connect(ctx.destination);x={ctx,gain};NF4.userGain.set(a,x);return x}catch(e){return null}}
function applyVolume(uid){const v=storedVolume(uid),muted=localStorage.getItem('nfUserMuted:'+uid)==='1';audioEls(uid).forEach(a=>{a.muted=muted||!!window.voiceDeafened;const x=gainFor(a);if(x){a.volume=1;x.gain.gain.setTargetAtTime(v,x.ctx.currentTime,.01)}else a.volume=Math.min(1,v)})}
window.nf4ApplyUserVolume=applyVolume;
function ensureAudio(id){let a=$(id);if(!a){a=document.createElement('audio');a.id=id;a.autoplay=true;a.playsInline=true;a.style.display='none';document.body.appendChild(a)}return a}
function playSafe(a){if(!a?.srcObject)return;const ctx=ensureCtx();if(ctx?.state==='suspended')ctx.resume().catch(()=>{});if(a.paused)a.play().catch(()=>{})}
function healAudio(){qa('audio[id^="voiceAudio-"],audio[id^="voiceScreenAudio-"]').forEach(a=>{applyVolume(uidFromAudio(a));playSafe(a)})}
['pointerdown','keydown','click'].forEach(ev=>document.addEventListener(ev,()=>{ensureCtx()?.resume?.().catch(()=>{});healAudio()},{capture:true,passive:true}));document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(healAudio,40)});window.addEventListener('focus',()=>setTimeout(healAudio,40));setInterval(healAudio,1200);

// Processamento forte disponível sem serviço externo/ML. Mantém constraints nativas e um gate conservador.
try{if(typeof createEnhancedMicStream==='function')createEnhancedMicStream=async function(){
  const noise=localStorage.getItem('nfNoise')!=='off',echo=localStorage.getItem('nfEcho')!=='off',gainOn=localStorage.getItem('nfGain')!=='off';
  const raw=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:echo,noiseSuppression:noise,autoGainControl:gainOn,channelCount:1,sampleRate:{ideal:48000},sampleSize:{ideal:16}},video:false});
  try{if(typeof enhancedMicRaw!=='undefined')enhancedMicRaw=raw}catch{}
  if(!noise)return raw;
  try{const AC=window.AudioContext||window.webkitAudioContext,ctx=new AC({latencyHint:'interactive',sampleRate:48000}),src=ctx.createMediaStreamSource(raw),hp=ctx.createBiquadFilter(),lp=ctx.createBiquadFilter(),comp=ctx.createDynamicsCompressor(),gate=ctx.createGain(),an=ctx.createAnalyser(),dest=ctx.createMediaStreamDestination();
    try{if(typeof enhancedAudioCtx!=='undefined')enhancedAudioCtx=ctx}catch{}
    hp.type='highpass';hp.frequency.value=125;hp.Q.value=.7;lp.type='lowpass';lp.frequency.value=7800;lp.Q.value=.65;comp.threshold.value=-30;comp.knee.value=10;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.12;an.fftSize=1024;an.smoothingTimeConstant=.72;gate.gain.value=.025;
    src.connect(hp).connect(lp).connect(comp);comp.connect(an);comp.connect(gate).connect(dest);
    const data=new Float32Array(an.fftSize);let level=.025,hold=0,noiseFloor=.008;const tick=()=>{if(ctx.state==='closed')return;an.getFloatTimeDomainData(data);let rms=0;for(const v of data)rms+=v*v;rms=Math.sqrt(rms/data.length);if(rms<noiseFloor*1.8)noiseFloor=noiseFloor*.985+rms*.015;const threshold=Math.max(.018,noiseFloor*3.2);let target=.025;if(rms>threshold){target=1;hold=12}else if(hold>0){hold--;target=.72}level+=(target-level)*(target>level?.48:.18);gate.gain.setTargetAtTime(level,ctx.currentTime,.012);requestAnimationFrame(tick)};requestAnimationFrame(tick);return dest.stream
  }catch{return raw}
}catch(e){console.warn('[NF4] mic pipeline',e)}}}catch{}

// Um único estado real para áudio da transmissão. Alterar o toggle muda a track já ativa.
window.nf4SetStreamAudio=function(on){NF4.streamAudio=!!on;localStorage.setItem('nf4StreamAudio',on?'1':'0');try{if(typeof localScreenStream!=='undefined'&&localScreenStream)localScreenStream.getAudioTracks().forEach(t=>t.enabled=NF4.streamAudio)}catch{};syncShareAudioUI();return NF4.streamAudio};
function syncShareAudioUI(){qa('#shareAudioToggle,[data-share-audio],.nf-share-audio').forEach(el=>{if('checked'in el)el.checked=NF4.streamAudio;el.classList.toggle('on',NF4.streamAudio);el.setAttribute('aria-checked',String(NF4.streamAudio))})}
document.addEventListener('change',e=>{if(e.target?.matches?.('#shareAudioToggle,[data-share-audio]'))nf4SetStreamAudio(!!e.target.checked)},true);document.addEventListener('click',e=>{const t=e.target.closest?.('.nf-share-audio');if(t&&!('checked'in t))nf4SetStreamAudio(!NF4.streamAudio)},true);setInterval(syncShareAudioUI,900);
const oldOpenShare=window.openSharePicker;if(typeof oldOpenShare==='function')window.openSharePicker=async function(){const r=await oldOpenShare.apply(this,arguments);setTimeout(()=>{const t=$('shareAudioToggle');if(t)t.checked=NF4.streamAudio;syncShareAudioUI()},0);return r};
const oldStartShare=window.startSelectedShare;if(typeof oldStartShare==='function')window.startSelectedShare=async function(){const t=$('shareAudioToggle');if(t)t.checked=NF4.streamAudio;const r=await oldStartShare.apply(this,arguments);setTimeout(()=>{try{if(typeof localScreenStream!=='undefined'&&localScreenStream)localScreenStream.getAudioTracks().forEach(x=>x.enabled=NF4.streamAudio)}catch{};syncShareAudioUI()},50);return r};

function classifyTrack(e){const stream=e.streams?.[0]||new MediaStream([e.track]),hasVideo=stream.getVideoTracks().length>0;return {stream,hasVideo}}
function attachIncoming(uid,e){if(!e.track)return;const {stream,hasVideo}=classifyTrack(e);
  if(e.track.kind==='audio'){
    const a=ensureAudio((hasVideo?'voiceScreenAudio-':'voiceAudio-')+uid);a.srcObject=new MediaStream([e.track]);applyVolume(uid);playSafe(a);if(!hasVideo)try{startSpeakingDetection(uid,new MediaStream([e.track]))}catch{}
  }else if(e.track.kind==='video'){
    try{if(typeof remoteStreams!=='undefined')remoteStreams[uid]=stream}catch{}
    try{attachRemoteTrack(uid,stream)}catch{}
    e.track.onmute=()=>{setTimeout(()=>{if(e.track.readyState==='live'){qa(`#voiceCallRemote-${uid} video,#voiceTile-${uid} video`).forEach(v=>{if(v.srcObject!==stream)v.srcObject=stream;v.play().catch(()=>{})})}},450)};
    e.track.onunmute=()=>qa(`#voiceCallRemote-${uid} video,#voiceTile-${uid} video`).forEach(v=>{if(v.srcObject!==stream)v.srcObject=stream;v.play().catch(()=>{})});
  }
}
async function recoverPeer(uid,pc){if(!pc||pc.signalingState==='closed'||NF4.peerRecovery.get(uid))return;NF4.peerRecovery.set(uid,true);try{if(pc.restartIce)pc.restartIce();if(pc.signalingState==='stable'){const offer=await pc.createOffer({iceRestart:true});await pc.setLocalDescription(offer);await sendVoiceSignal(uid,{type:'offer',sdp:pc.localDescription.toJSON()})}}catch(e){console.warn('[NF4] ICE restart',e)}finally{setTimeout(()=>NF4.peerRecovery.delete(uid),3500)}}

// Substitui somente a criação do peer; preserva sinalização/Firebase existentes.
try{createPeer=async function(uid,initiator=false){
  if(voicePeers[uid]&&voicePeers[uid].connectionState!=='closed')return voicePeers[uid];
  const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'}],iceCandidatePoolSize:4});voicePeers[uid]=pc;
  if(localVoiceStream)localVoiceStream.getTracks().forEach(t=>pc.addTrack(t,localVoiceStream));if(localScreenStream)localScreenStream.getTracks().forEach(t=>pc.addTrack(t,localScreenStream));
  pc.onicecandidate=e=>{if(e.candidate)sendVoiceSignal(uid,{type:'candidate',candidate:e.candidate.toJSON()})};pc.ontrack=e=>attachIncoming(uid,e);
  pc.onconnectionstatechange=()=>{const st=pc.connectionState;if(st==='failed')recoverPeer(uid,pc);else if(st==='disconnected'){setTimeout(()=>{if(pc.connectionState==='disconnected')recoverPeer(uid,pc)},3500)}else if(st==='connected'){NF4.peerRecovery.delete(uid);healAudio()}else if(st==='closed'){try{removePeer(uid)}catch{}}};
  pc.oniceconnectionstatechange=()=>{if(pc.iceConnectionState==='failed')recoverPeer(uid,pc)};
  pc.onnegotiationneeded=async()=>{if(pc.signalingState!=='stable')return;try{const offer=await pc.createOffer();await pc.setLocalDescription(offer);await sendVoiceSignal(uid,{type:'offer',sdp:pc.localDescription.toJSON()})}catch(e){console.warn('[NF4] negotiate',e)}};
  if(initiator&&pc.signalingState==='stable'){try{const offer=await pc.createOffer();await pc.setLocalDescription(offer);await sendVoiceSignal(uid,{type:'offer',sdp:pc.localDescription.toJSON()})}catch(e){console.warn('[NF4] initial offer',e)}}return pc
}}catch(e){console.warn('[NF4] createPeer override',e)}

// Mantém vídeos remotos tocando se o elemento for pausado/recriado pela UI.
setInterval(()=>{qa('#voiceCallGrid video,.voice-stage-grid video').forEach(v=>{if(v.srcObject&&v.paused)v.play().catch(()=>{})});healAudio()},1800);
console.info('[Nuvem Fofa] V4 core carregado — validação real de duas máquinas ainda necessária');
})();
