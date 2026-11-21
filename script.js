document.querySelector('.menu').addEventListener('click',()=>{const nav=document.querySelector('nav');const shown=nav.style.display==='flex';nav.style.display=shown?'none':'flex';if(!shown){nav.style.position='absolute';nav.style.top='70px';nav.style.left='0';nav.style.right='0';nav.style.padding='25px 8vw';nav.style.background='#11110f';nav.style.flexDirection='column';nav.style.gap='20px'}});
document.getElementById('contactForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const subject=encodeURIComponent('Music project enquiry — '+f.get('name'));const body=encodeURIComponent(`Name: ${f.get('name')}\nEmail: ${f.get('email')}\nProject: ${f.get('project')}\n\n${f.get('message')}`);window.location.href=`mailto:hello@ajaymusic.example?subject=${subject}&body=${body}`;document.getElementById('formNote').textContent='Your email app should open with the enquiry prepared. Replace the demo email address before publishing.'});


// YouTube IFrame API: animate the visualizer while the embedded track is playing.
(() => {
  const iframe = document.getElementById('ncsPlayer');
  const visualizer = document.getElementById('musicVisualizer');
  const label = document.getElementById('visualizerLabel');
  if (!iframe || !visualizer || !label) return;

  let player;
  const setPlaying = (playing) => {
    visualizer.classList.toggle('is-playing', playing);
    label.textContent = playing ? 'NOW PLAYING · ON & ON' : 'SOUND IN MOTION · PRESS PLAY';
  };

  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player(iframe, {
      events: {
        onReady: () => setPlaying(false),
        onStateChange: (event) => {
          // YT.PlayerState.PLAYING === 1
          setPlaying(event.data === 1);
        }
      }
    });
  };

  const api = document.createElement('script');
  api.src = 'https://www.youtube.com/iframe_api';
  api.async = true;
  document.head.appendChild(api);
})();
