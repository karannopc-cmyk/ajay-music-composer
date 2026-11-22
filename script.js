document.querySelector('.menu').addEventListener('click',()=>{const nav=document.querySelector('nav');const shown=nav.style.display==='flex';nav.style.display=shown?'none':'flex';if(!shown){nav.style.position='absolute';nav.style.top='70px';nav.style.left='0';nav.style.right='0';nav.style.padding='25px 8vw';nav.style.background='#11110f';nav.style.flexDirection='column';nav.style.gap='20px'}});
document.getElementById('contactForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const subject=encodeURIComponent('Music project enquiry — '+f.get('name'));const body=encodeURIComponent(`Name: ${f.get('name')}\nEmail: ${f.get('email')}\nProject: ${f.get('project')}\n\n${f.get('message')}`);window.location.href=`mailto:hello@ajaymusic.example?subject=${subject}&body=${body}`;document.getElementById('formNote').textContent='Your email app should open with the enquiry prepared. Replace the demo email address before publishing.'});


// Featured-track audio visualizer (starts only after the visitor presses Play).
(()=>{
  const audio=document.getElementById('featuredAudio');
  const canvas=document.getElementById('visualizerCanvas');
  if(!audio||!canvas) return;

  const ctx=canvas.getContext('2d');
  if(!ctx) return;

  let audioContext=null, analyser=null, source=null, data=null, frame=0;
  let active=false;

  const resize=()=>{
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(rect.width*dpr));
    canvas.height=Math.max(1,Math.round(rect.height*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    drawIdle();
  };

  const drawIdle=()=>{
    const w=canvas.clientWidth,h=canvas.clientHeight;
    ctx.clearRect(0,0,w,h);
    const bars=48,gap=4,barW=Math.max(2,(w-gap*(bars-1))/bars);
    for(let i=0;i<bars;i++){
      const wave=.12+Math.abs(Math.sin(i*.34))*0.18;
      const bh=Math.max(3,h*wave);
      const x=i*(barW+gap);
      const grad=ctx.createLinearGradient(0,h-bh,0,h);
      grad.addColorStop(0,'rgba(223,193,138,.95)');
      grad.addColorStop(1,'rgba(139,105,59,.28)');
      ctx.fillStyle=grad;
      ctx.fillRect(x,(h-bh)/2,barW,bh);
    }
  };

  const animate=()=>{
    if(!active||!analyser) return;
    frame=requestAnimationFrame(animate);
    analyser.getByteFrequencyData(data);
    const w=canvas.clientWidth,h=canvas.clientHeight;
    ctx.clearRect(0,0,w,h);
    const bars= Math.min(64,Math.max(24,Math.floor(w/8)));
    const gap=3,barW=(w-gap*(bars-1))/bars;
    for(let i=0;i<bars;i++){
      const index=Math.floor(i/bars*data.length*.78);
      const value=data[index]/255;
      const bh=Math.max(3,value*(h*.78));
      const x=i*(barW+gap);
      const grad=ctx.createLinearGradient(0,(h-bh)/2,0,(h+bh)/2);
      grad.addColorStop(0,'#e1c58f');
      grad.addColorStop(1,'#8f754e');
      ctx.fillStyle=grad;
      ctx.shadowColor='rgba(199,166,107,.28)';
      ctx.shadowBlur=8;
      ctx.fillRect(x,(h-bh)/2,Math.max(1,barW),bh);
    }
    ctx.shadowBlur=0;
  };

  const start=async()=>{
    try{
      if(!audioContext){
        audioContext=new (window.AudioContext||window.webkitAudioContext)();
        analyser=audioContext.createAnalyser();
        analyser.fftSize=256;
        analyser.smoothingTimeConstant=.82;
        source=audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        data=new Uint8Array(analyser.frequencyBinCount);
      }
      if(audioContext.state==='suspended') await audioContext.resume();
      active=true;
      cancelAnimationFrame(frame);
      animate();
    }catch(error){
      // If Web Audio is unavailable, the native audio player still works normally.
      active=false;
      drawIdle();
    }
  };

  audio.addEventListener('play',start);
  audio.addEventListener('pause',()=>{active=false;cancelAnimationFrame(frame);drawIdle()});
  audio.addEventListener('ended',()=>{active=false;cancelAnimationFrame(frame);drawIdle()});
  window.addEventListener('resize',resize);
  resize();
})();

// Custom dark-and-gold audio controls
(()=>{
  const audio=document.getElementById('featuredAudio');
  const play=document.getElementById('audioPlay');
  const seek=document.getElementById('audioSeek');
  const current=document.getElementById('audioCurrent');
  const duration=document.getElementById('audioDuration');
  const mute=document.getElementById('audioMute');
  if(!audio||!play||!seek) return;
  const time=t=>{if(!Number.isFinite(t))return '0:00';const m=Math.floor(t/60),s=Math.floor(t%60);return `${m}:${String(s).padStart(2,'0')}`};
  const paint=()=>{const pct=audio.duration?audio.currentTime/audio.duration*100:0;seek.value=pct;seek.style.background=`linear-gradient(to right,var(--gold) 0%,var(--gold) ${pct}%,#454139 ${pct}%,#454139 100%)`;current.textContent=time(audio.currentTime)};
  play.addEventListener('click',()=>{if(audio.paused) audio.play().catch(()=>{});else audio.pause()});
  audio.addEventListener('play',()=>{play.textContent='Ⅱ';play.setAttribute('aria-label','Pause Aetheria')});
  audio.addEventListener('pause',()=>{play.textContent='▶';play.setAttribute('aria-label','Play Aetheria')});
  audio.addEventListener('loadedmetadata',()=>{duration.textContent=time(audio.duration);paint()});
  audio.addEventListener('timeupdate',paint);
  seek.addEventListener('input',()=>{if(audio.duration)audio.currentTime=(Number(seek.value)/100)*audio.duration;paint()});
  mute.addEventListener('click',()=>{audio.muted=!audio.muted;mute.textContent=audio.muted?'×':'♪';mute.setAttribute('aria-label',audio.muted?'Unmute audio':'Mute audio')});
})();


// On-demand QR code for the current AJAYVYRA website address.
(()=>{
  const modal=document.getElementById('qrModal');
  const target=document.getElementById('websiteQr');
  const urlLabel=document.getElementById('qrUrl');
  const openers=[document.getElementById('openQr'),document.getElementById('openQrFooter')].filter(Boolean);
  const close=document.getElementById('closeQr');
  const download=document.getElementById('downloadQr');
  if(!modal||!target||!openers.length)return;
  let generated=false;
  const siteUrl=window.location.origin+window.location.pathname+window.location.search;
  urlLabel.textContent=siteUrl;
  const show=()=>{
    modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    if(!generated){
      if(typeof QRCode==='undefined'){target.textContent='QR code library could not load. Please check your connection and try again.';return;}
      new QRCode(target,{text:siteUrl,width:240,height:240,colorDark:'#11110f',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});generated=true;
    }
    close.focus();
  };
  const hide=()=>{modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';};
  openers.forEach(button=>button.addEventListener('click',show));
  close.addEventListener('click',hide);
  modal.addEventListener('click',e=>{if(e.target===modal)hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))hide();});
  download.addEventListener('click',()=>{
    const img=target.querySelector('img');const canvas=target.querySelector('canvas');
    const data=img?.src||(canvas?canvas.toDataURL('image/png'):null);
    if(!data)return;
    const link=document.createElement('a');link.href=data;link.download='AJAYVYRA-website-QR.png';document.body.appendChild(link);link.click();link.remove();
  });
})();
