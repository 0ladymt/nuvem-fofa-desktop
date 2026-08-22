// Nuvem Fofa v0.3.15 — estabilidade primeiro + pipeline isolado de imagens
(() => {
  const $ = id => document.getElementById(id);
  const qa = (s,r=document) => [...r.querySelectorAll(s)];
  const pending = { avatar:null, banner:null, serverIcon:null, serverCover:null };
  let drag = null;

  // Esta versão NÃO mexe no seletor de transmissão. A v0.3.14 foi retirada do preload.
  // O objetivo aqui é isolar completamente o fluxo das quatro imagens.

  function toastErr(prefix,e){
    console.error('[v0.3.15]',prefix,e);
    toast(`${prefix}: ${e?.message || e || 'erro desconhecido'}`);
  }

  function frameFor(type){
    return (type === 'avatar' || type === 'serverIcon') ? {w:190,h:190} : {w:300,h:112};
  }

  function updatePreview(){
    if(!cropState?.img) return;
    const stage = $('cropStage'), el = $('cropImage');
    if(!stage || !el) return;
    const f = frameFor(cropState.type);
    const z = Math.max(1,Math.min(6,Number(cropState.z)||1));
    const x = Number(cropState.x)||0, y = Number(cropState.y)||0;
    const base = Math.max(f.w/cropState.img.width,f.h/cropState.img.height);
    el.style.width = `${cropState.img.width*base*z}px`;
    el.style.height = `${cropState.img.height*base*z}px`;
    el.style.left = '50%'; el.style.top = '50%';
    el.style.transform = `translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;
    const zoom = $('cropZoom'); if(zoom && Number(zoom.value)!==z) zoom.value=String(z);
  }

  function bindGestures(){
    const stage=$('cropStage'); if(!stage) return;
    stage.onpointerdown=e=>{
      if(!cropState) return;
      drag={sx:e.clientX,sy:e.clientY,x:Number(cropState.x)||0,y:Number(cropState.y)||0};
      try{stage.setPointerCapture(e.pointerId)}catch{}
      stage.classList.add('dragging');
    };
    stage.onpointermove=e=>{
      if(!drag||!cropState) return;
      const f=frameFor(cropState.type), limX=f.w*.95, limY=f.h*.95;
      cropState.x=Math.max(-limX,Math.min(limX,drag.x+e.clientX-drag.sx));
      cropState.y=Math.max(-limY,Math.min(limY,drag.y+e.clientY-drag.sy));
      updatePreview();
    };
    stage.onpointerup=stage.onpointercancel=()=>{drag=null;stage.classList.remove('dragging')};
    stage.onwheel=e=>{
      if(!cropState) return;
      e.preventDefault();
      cropState.z=Math.max(1,Math.min(6,(Number(cropState.z)||1)+(e.deltaY<0?.12:-.12)));
      updatePreview();
    };
    const zoom=$('cropZoom');
    if(zoom) zoom.oninput=()=>{if(cropState){cropState.z=Number(zoom.value)||1;updatePreview()}};
  }

  function bindApplyButton(){
    const btn=qa('#cropModal .modal-actions button').find(b=>/aplicar/i.test(b.textContent||''));
    if(!btn) return;
    btn.removeAttribute('onclick');
    btn.onclick=e=>{e.preventDefault();e.stopPropagation();window.applyCrop()};
  }

  function beginCrop(input,type){
    const file=input?.files?.[0]; if(!file) return;
    if(file.size>20*1024*1024){input.value='';return toast('Imagem muito grande. Use uma imagem de até 20 MB.')}
    const reader=new FileReader();
    reader.onerror=()=>toast('Não consegui ler essa imagem.');
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>toast('O arquivo selecionado não pôde ser aberto como imagem.');
      img.onload=()=>{
        cropState={type,input,img,src:reader.result,x:0,y:0,z:1};
        const preview=$('cropImage'); if(preview) preview.src=reader.result;
        const zoom=$('cropZoom'); if(zoom) zoom.value='1';
        const stage=$('cropStage'); if(stage) stage.className='crop-stage '+((type==='avatar'||type==='serverIcon')?'avatar-mode':'banner-mode');
        const title=$('cropTitle'); if(title) title.textContent=({avatar:'Ajustar foto de perfil',banner:'Ajustar capa',serverIcon:'Ajustar foto do servidor',serverBanner:'Ajustar capa do servidor'})[type]||'Ajustar imagem';
        bindGestures(); bindApplyButton(); updatePreview(); openModal('cropModal');
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  }

  function exportCrop(){
    if(!cropState?.img) return null;
    const square=cropState.type==='avatar'||cropState.type==='serverIcon';
    const ow=square?512:1200, oh=square?512:448;
    const f=frameFor(cropState.type), img=cropState.img;
    const z=Math.max(1,Number(cropState.z)||1), x=Number(cropState.x)||0, y=Number(cropState.y)||0;
    const scale=Math.max(f.w/img.width,f.h/img.height)*z;
    const sw=Math.min(img.width,f.w/scale), sh=Math.min(img.height,f.h/scale);
    const sx=Math.max(0,Math.min(img.width-sw,(img.width-sw)/2-x/scale));
    const sy=Math.max(0,Math.min(img.height-sh,(img.height-sh)/2-y/scale));
    const c=document.createElement('canvas'); c.width=ow; c.height=oh;
    const ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,sx,sy,sw,sh,0,0,ow,oh);
    let q=.88, data=c.toDataURL('image/webp',q);
    while(data.length>900000 && q>.56){q-=.08;data=c.toDataURL('image/webp',q)}
    return data;
  }

  window.openCropper=(input,type)=>beginCrop(input,type);
  window.openServerIconCrop=input=>beginCrop(input,'serverIcon');
  window.openServerCoverCrop=input=>beginCrop(input,'serverBanner');
  window.previewServerCover=input=>beginCrop(input,'serverBanner');

  window.applyCrop=function(){
    if(!cropState) return;
    const type=cropState.type, data=exportCrop();
    if(!data) return toast('Não consegui processar a imagem.');
    if(type==='avatar'){
      pending.avatar=data; pendingAvatarData=data;
      if($('profileAvatarPreview')) $('profileAvatarPreview').src=data;
    } else if(type==='banner'){
      pending.banner=data; pendingBannerData=data;
      if($('profileBanner')) $('profileBanner').style.backgroundImage=`url("${data}")`;
    } else if(type==='serverIcon'){
      pending.serverIcon=data; window.pendingServerIcon=data;
      const p=$('serverIconPreview'); if(p){p.style.backgroundImage=`url("${data}")`;p.style.backgroundSize='cover';p.style.backgroundPosition='center';p.textContent=''}
    } else if(type==='serverBanner'){
      pending.serverCover=data; pendingServerCover=data;
      const p=$('serverCoverPreview'); if(p){p.style.backgroundImage=`url("${data}")`;p.style.backgroundSize='cover';p.style.backgroundPosition='center'}
    }
    try{cropState.input.value=''}catch{}
    cropState=null; closeModal('cropModal');
  };

  window.cancelCrop=function(){
    try{if(cropState?.input)cropState.input.value=''}catch{}
    cropState=null;drag=null;closeModal('cropModal');
  };

  window.openProfile=function(){
    if(!currentUserData) return;
    pending.avatar=pending.banner=null; pendingAvatarData=pendingBannerData=null;
    if($('profileAvatarPreview')) $('profileAvatarPreview').src=imgFor(currentUserData);
    if($('profileBanner')) $('profileBanner').style.backgroundImage=currentUserData.banner?`url("${currentUserData.banner}")`:'';
    if($('profileUsername')) $('profileUsername').value=currentUserData.username||'';
    if($('profileStatus')) $('profileStatus').value=currentUserData.status||'';
    if($('profileBio')) $('profileBio').value=currentUserData.bio||'';
    if($('profilePreviewName')) $('profilePreviewName').textContent=currentUserData.username||'Usuário';
    if($('profilePreviewEmail')) $('profilePreviewEmail').textContent=currentUserData.email||currentUser?.email||'';
    bindApplyButton(); openModal('profileModal');
  };

  window.saveProfile=async function(){
    if(!currentUser||!db) return;
    const uid=currentUser.uid;
    const patch={
      username:$('profileUsername')?.value?.trim()||currentUserData?.username||'Usuário',
      status:$('profileStatus')?.value?.trim()||'',
      bio:$('profileBio')?.value?.trim()||'',
      updatedAt:firebase.database.ServerValue.TIMESTAMP
    };
    if(pending.avatar) patch.avatar=pending.avatar;
    if(pending.banner) patch.banner=pending.banner;
    try{
      await db.ref(`users/${uid}`).update(patch);
      const snap=await db.ref(`users/${uid}`).once('value'), saved=snap.val()||{};
      if(pending.avatar && saved.avatar!==pending.avatar) throw new Error('o banco não confirmou a nova foto de perfil');
      if(pending.banner && saved.banner!==pending.banner) throw new Error('o banco não confirmou a nova capa');
      currentUserData=saved;
      if($('meAvatar')) $('meAvatar').src=imgFor(saved);
      if($('profileAvatarPreview')) $('profileAvatarPreview').src=imgFor(saved);
      if($('profileBanner')) $('profileBanner').style.backgroundImage=saved.banner?`url("${saved.banner}")`:'';
      qa(`img[data-voice-user="${uid}"], [data-voice-user="${uid}"] img`).forEach(i=>i.src=imgFor(saved));
      if(voiceRoom){
        await db.ref(`voiceParticipants/${voiceRoom.channelId}/${uid}`).update({avatar:saved.avatar||'',username:saved.username||'Usuário'}).catch(()=>{});
        try{renderVoicePanel();refreshVoiceCallGrid();refreshVoiceSidebarParticipants()}catch{}
      }
      pending.avatar=pending.banner=null;pendingAvatarData=pendingBannerData=null;
      closeModal('profileModal');toast('Perfil atualizado e confirmado no banco.');
    }catch(e){toastErr('Não consegui salvar a imagem do perfil',e)}
  };

  const previousOpenServer=window.openServerSettings;
  window.openServerSettings=async function(){
    if(typeof previousOpenServer==='function') await previousOpenServer();
    pending.serverIcon=pending.serverCover=null;window.pendingServerIcon=null;pendingServerCover=null;
    if(!currentServer||!db) return;
    try{
      const s=await db.ref(`servers/${currentServer}`).once('value'),d=s.val()||{};
      const icon=$('serverIconPreview');if(icon){icon.style.backgroundImage=d.icon?`url("${d.icon}")`:'';icon.style.backgroundSize='cover';icon.style.backgroundPosition='center';icon.textContent=d.icon?'':(d.name||'S').slice(0,1).toUpperCase()}
      const cover=$('serverCoverPreview');if(cover){cover.style.backgroundImage=d.cover?`url("${d.cover}")`:'';cover.style.backgroundSize='cover';cover.style.backgroundPosition='center'}
      bindApplyButton();
    }catch(e){toastErr('Não consegui carregar as imagens do servidor',e)}
  };

  window.saveServerSettings=async function(){
    if(!currentServer||!db) return;
    const sid=currentServer;
    const patch={name:$('serverEditName')?.value?.trim()||'Servidor',updatedAt:firebase.database.ServerValue.TIMESTAMP};
    if(pending.serverIcon) patch.icon=pending.serverIcon;
    if(pending.serverCover) patch.cover=pending.serverCover;
    try{
      await db.ref(`servers/${sid}`).update(patch);
      const snap=await db.ref(`servers/${sid}`).once('value'),saved=snap.val()||{};
      if(pending.serverIcon && saved.icon!==pending.serverIcon) throw new Error('o banco não confirmou a nova foto do servidor');
      if(pending.serverCover && saved.cover!==pending.serverCover) throw new Error('o banco não confirmou a nova capa do servidor');
      pending.serverIcon=pending.serverCover=null;window.pendingServerIcon=null;pendingServerCover=null;
      closeModal('serverSettingsModal');
      try{loadServers();selectServer(sid,saved)}catch{}
      toast('Servidor atualizado e imagens confirmadas no banco.');
    }catch(e){toastErr('Não consegui salvar a imagem do servidor',e)}
  };

  // Garante que o botão Aplicar nunca volte a apontar para uma função antiga quando o modal abrir.
  const modalObserver=new MutationObserver(muts=>{
    for(const m of muts){
      if(m.type==='attributes' && m.target?.id==='cropModal' && m.target.classList.contains('active')) bindApplyButton();
    }
  });
  const cropModal=$('cropModal'); if(cropModal) modalObserver.observe(cropModal,{attributes:true,attributeFilter:['class']});

  console.info('[Nuvem Fofa] v0.3.15 estabilidade/imagens carregado');
})();
