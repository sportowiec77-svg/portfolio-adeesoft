
/* PAGE: index.html */

    (() => {
        const searchContainer = document.querySelector('.search-container');
        const searchBtn = document.querySelector('.search-btn');
        const searchInput = document.querySelector('.search-input');
        const themeToggle = document.querySelector('.theme-toggle');

        if (searchBtn && searchContainer) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                searchContainer.classList.toggle('open');
                if (searchContainer.classList.contains('open') && searchInput) {
                    setTimeout(() => searchInput.focus(), 30);
                }
            });
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                // Strona pozostaje w ciemnym stylu; przycisk pełni subtelną funkcję jasności.
                document.body.classList.toggle('soft-light');
                const moon = themeToggle.querySelector('.moon-icon');
                const sun = themeToggle.querySelector('.sun-icon');
                if (moon && sun) {
                    moon.classList.toggle('hidden');
                    sun.classList.toggle('hidden');
                }
            });
        }

        document.documentElement.style.scrollBehavior = 'smooth';
    })();
    

/* PAGE: index.html */

(() => {
  const canvas = document.getElementById('neuron-canvas');
  const hero = document.getElementById('hero-stage');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isMobile = matchMedia('(max-width:760px)').matches;

  let w=0,h=0,dpr=1;
  let raf=0,last=0;
  let mouseX=0, mouseY=0;
  let targetX=0, targetY=0;
  let heroVisible=true, pageVisible=!document.hidden;
    let initialized=false;

  const branches=[];
  const sparks=[];
  const palette=['#10e8f4','#66ff4d','#eaff35','#ff42a8','#8b63ff','#ff983d'];

  const cfg = {
    mobile:{
      fps:24,
      branchCount:8,
      childDepth:1,
      sparkCount:6,
      coreX:.72,
      coreY:.445,
      axonLen:.42,
      branchMin:105,
      branchMax:175,
      lineMain:1.55,
      lineTwig:1.0,
      glowCyan:45,
      glowPink:41
    },
    desktop:{
      fps:40,
      branchCount:16,
      childDepth:2,
      sparkCount:12,
      coreX:.68,
      coreY:.56,
      axonLen:.52,
      branchMin:150,
      branchMax:255,
      lineMain:1.8,
      lineTwig:1.05,
      glowCyan:70,
      glowPink:64
    }
  };

  function activeCfg(){ return isMobile ? cfg.mobile : cfg.desktop; }
  function rnd(a,b){ return a + Math.random()*(b-a); }

  function growBranch(x,y,angle,length,depth,maxDepth){
    const pts=[{x,y}];
    let px=x, py=y, a=angle;
    const seg = depth===0 ? (isMobile?5:6) : 4;

    for(let i=0;i<seg;i++){
      a += rnd(-.26,.26);
      const step=length/seg;
      px += Math.cos(a)*step;
      py += Math.sin(a)*step;
      pts.push({x:px,y:py});
    }
    branches.push({pts,depth});

    if(depth<maxDepth){
      const children = depth===0 ? (isMobile?1:2) : 1;
      for(let c=0;c<children;c++){
        const idx = Math.min(pts.length-1, 2 + Math.floor(Math.random()*Math.max(1,pts.length-3)));
        const p=pts[idx];
        growBranch(p.x,p.y,a+rnd(-1.05,1.05),length*(depth===0?.55:.5),depth+1,maxDepth);
      }
    }
  }

  function rebuild(){
    branches.length=0;
    sparks.length=0;

    const c=activeCfg();
    const cx=w*c.coreX;
    const cy=h*c.coreY;
    const scale=Math.min(w,h)/(isMobile?410:760);

    for(let i=0;i<c.branchCount;i++){
      const a=(i/c.branchCount)*Math.PI*2+rnd(-.17,.17);
      growBranch(cx,cy,a,rnd(c.branchMin,c.branchMax)*scale,0,c.childDepth);
    }

    // Long axon
    const axon=[];
    for(let i=0;i<=24;i++){
      const t=i/24;
      axon.push({
        x:cx - t*(w*c.axonLen),
        y:cy + Math.sin(t*Math.PI*1.25)*6*scale
      });
    }
    branches.push({pts:axon,depth:-1,axon:true});

    for(let i=0;i<c.sparkCount;i++){
      sparks.push({
        a:Math.random()*Math.PI*2,
        r:rnd(isMobile?24:34,isMobile?48:78)*scale,
        speed:rnd(.00028,.00062),
        color:palette[i%palette.length],
        phase:Math.random()*Math.PI*2,
        size:rnd(1.8,3.1)*scale
      });
    }
  }

  function resize(){
    isMobile = matchMedia('(max-width:760px)').matches;
    dpr = Math.min(devicePixelRatio||1, isMobile?1:1.15);
    w = innerWidth;
    h = Math.max(hero.clientHeight, innerHeight);
    canvas.width = Math.round(w*dpr);
    canvas.height = Math.round(h*dpr);
    canvas.style.width = w+'px';
    canvas.style.height = h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    rebuild();
  }

  function glowCircle(x,y,r,color,alpha=1){
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,color);
    g.addColorStop(.25,color);
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawBackground(){
    ctx.fillStyle='#010205';
    ctx.fillRect(0,0,w,h);

    // very subtle static-like grid, cheap
    if(!isMobile){
      ctx.save();
      ctx.strokeStyle='rgba(0,234,255,.025)';
      ctx.lineWidth=1;
      const step=42;
      for(let x=0;x<w;x+=step){
        ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();
      }
      for(let y=0;y<h;y+=step){
        ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
      }
      ctx.restore();
    }
  }

  function draw(ts=0){
    raf=requestAnimationFrame(draw);
    if(!heroVisible || !pageVisible) return;

    const c=activeCfg();
    const frame=1000/c.fps;
    if(ts-last<frame) return;
    last=ts;

    drawBackground();

    const baseCx=w*c.coreX;
    const baseCy=h*c.coreY;

    // parallax only desktop
    if(!isMobile){
      targetX += (mouseX-targetX)*.05;
      targetY += (mouseY-targetY)*.05;
    } else {
      targetX=targetY=0;
    }

    const pxShift = isMobile ? 0 : targetX*18;
    const pyShift = isMobile ? 0 : targetY*10;

    ctx.save();
    ctx.translate(pxShift,pyShift);

    // branches
    ctx.lineCap='round';
    ctx.lineJoin='round';
    for(const b of branches){
      ctx.beginPath();
      ctx.moveTo(b.pts[0].x,b.pts[0].y);
      for(let i=1;i<b.pts.length;i++) ctx.lineTo(b.pts[i].x,b.pts[i].y);
      if(b.axon){
        ctx.strokeStyle='rgba(54,81,98,.72)';
        ctx.lineWidth=isMobile?2.0:2.2;
      }else if(b.depth===0){
        ctx.strokeStyle='rgba(48,71,86,.72)';
        ctx.lineWidth=c.lineMain;
      }else{
        ctx.strokeStyle='rgba(36,53,65,.46)';
        ctx.lineWidth=c.lineTwig;
      }
      ctx.stroke();
    }

    const scale=Math.min(w,h)/(isMobile?410:760);
    const cx=baseCx, cy=baseCy;

    // core glows
    glowCircle(cx-9*scale,cy,c.glowCyan*scale,'rgba(18,232,244,.40)',1);
    glowCircle(cx+11*scale,cy,c.glowPink*scale,'rgba(255,66,168,.28)',1);

    // subtle outer aura desktop
    if(!isMobile){
      glowCircle(cx,cy,115*scale,'rgba(28,116,170,.10)',1);
    }

    // organic core
    const pulse=1+Math.sin(ts*.0019)*.025;
    const rr=(isMobile?22:30)*scale*pulse;
    const rg=ctx.createLinearGradient(cx-rr,cy,cx+rr,cy);
    rg.addColorStop(0,'#18dfe9');
    rg.addColorStop(.48,'#bec8c6');
    rg.addColorStop(1,'#ff3ca6');
    ctx.fillStyle=rg;
    ctx.beginPath();
    const pts=isMobile?10:14;
    for(let i=0;i<pts;i++){
      const a=i/pts*Math.PI*2;
      const jitter=1+Math.sin(i*2.3+ts*.0012)*.08;
      const x=cx+Math.cos(a)*rr*jitter;
      const y=cy+Math.sin(a)*rr*jitter;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fill();

    // sparks
    for(const s of sparks){
      const a=s.a+ts*s.speed;
      const sx=cx+Math.cos(a)*s.r;
      const sy=cy+Math.sin(a)*s.r*.72;
      glowCircle(sx,sy,(isMobile?8:10)*scale,s.color,.28);
      ctx.fillStyle=s.color;
      ctx.beginPath();
      ctx.arc(sx,sy,s.size,0,Math.PI*2);
      ctx.fill();
    }

    // signal along axon
    const t=(ts*.00011)%1;
    const sx=cx - t*(w*c.axonLen);
    const sy=cy + Math.sin(t*Math.PI*1.25)*6*scale;
    glowCircle(sx,sy,(isMobile?15:18)*scale,'rgba(24,243,255,.58)',1);
    ctx.fillStyle='#18f3ff';
    ctx.beginPath();
    ctx.arc(sx,sy,(isMobile?3.2:4.0)*scale,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
  }

  addEventListener('pointermove',e=>{
    mouseX=(e.clientX/innerWidth)*2-1;
    mouseY=(e.clientY/innerHeight)*2-1;
  },{passive:true});

  document.addEventListener('visibilitychange',()=>{
    pageVisible=!document.hidden;
  });

  if('IntersectionObserver' in window){
    new IntersectionObserver(([entry])=>{
      heroVisible=!!entry?.isIntersecting;
    },{threshold:.01}).observe(hero);
  }

  let rt;
  addEventListener('resize',()=>{
    clearTimeout(rt);
        rt=setTimeout(()=>{
            if(initialized) resize();
        },120);
  },{passive:true});

    const startAnimation=()=>{
        resize();
        initialized=true;

        if(reducedMotion){
            draw(0);
            cancelAnimationFrame(raf);
        }else{
            requestAnimationFrame(draw);
        }
    };

    if('requestIdleCallback' in window){
        requestIdleCallback(startAnimation,{timeout:1500});
    }else{
        setTimeout(startAnimation,0);
    }
})();


/* PAGE: tworzenie-stron-mikolow.html */

(() => {
  const slides = [...document.querySelectorAll('.portfolio-slide')];
  const cityNodes = [...document.querySelectorAll('.city-node')];
  const visual = document.querySelector('.hero-design-visual');
  if (!slides.length || !cityNodes.length) return;

  let activeSlide = 0;
  let timer;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showSlide = index => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    cityNodes.forEach(node => {
      node.classList.toggle('is-active', Number(node.dataset.slideTarget) === activeSlide);
    });
  };

  const startTimer = () => {
    if (reducedMotion) return;
    clearInterval(timer);
    timer = setInterval(() => showSlide(activeSlide + 1), 3500);
  };

  cityNodes.forEach(node => {
    node.addEventListener('click', () => {
      showSlide(Number(node.dataset.slideTarget));
      startTimer();
    });
  });

  visual.addEventListener('mouseenter', () => clearInterval(timer));
  visual.addEventListener('mouseleave', startTimer);
  showSlide(0);
  startTimer();
})();


/* SHARED COMPONENT JS */
(() => {
  const currentPage = `${window.location.pathname.split('/').pop() || 'index.html'}`;
  const servicePages = new Set(['hosting-domeny.html', 'opieka.html', 'kursy-online.html', 'reklama.html', 'cennik.html']);
  const menu = document.querySelector('.nav-menu');
  const toggle = document.querySelector('.nav-toggle');
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = document.querySelector('.nav-dropdown-toggle');

  const closeMenu = () => {
    menu?.classList.remove('open');
    toggle?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Otwórz menu');
    dropdown?.classList.remove('is-open');
    dropdownToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  document.querySelectorAll('.nav-link[href], .footer-links a[href]').forEach((link) => {
    const target = link.getAttribute('href')?.split('#')[0].split('?')[0];
    const targetPage = target === '/' ? 'index.html' : target?.split('/').pop();
    if (targetPage === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
      if (servicePages.has(currentPage)) {
        dropdownToggle?.classList.add('active');
        dropdownToggle?.setAttribute('aria-current', 'page');
      }
    }
  });

  const setMenuState = (open) => {
    menu?.classList.toggle('open', open);
    toggle?.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    document.body.classList.toggle('menu-open', open);
  };

  toggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenuState(!menu?.classList.contains('open'));
  });

  dropdownToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = !dropdown?.classList.contains('is-open');
    dropdown?.classList.toggle('is-open', open);
    dropdownToggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.nav-menu a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (menu?.classList.contains('open') && !event.target.closest('.navbar')) closeMenu();
    if (dropdown?.classList.contains('is-open') && !event.target.closest('.nav-dropdown')) {
      dropdown.classList.remove('is-open');
      dropdownToggle?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      dropdown?.classList.remove('is-open');
      dropdownToggle?.setAttribute('aria-expanded', 'false');
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 950) closeMenu();
  });
})();
/* Portfolio: start wyciszonego wideo ze źródła, ładowanie przy zbliżeniu do mockupu. */
(() => {
  if (document.body.dataset.page !== 'portfolio') return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videos = [...document.querySelectorAll('.showcase-video')];
  const userPaused = new WeakSet();
  const loadVideo = (video) => {
    const source = video.querySelector('source[data-src]');
    if (!source) return;
    source.src = source.dataset.src;
    source.removeAttribute('data-src');
    video.load();
  };
  const playVideo = (video) => {
    loadVideo(video);
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
  };
  videos.forEach((video) => {
    if (reducedMotion) video.autoplay = false;
    const button = document.querySelector(`[aria-controls="${video.id}"]`);
    button.hidden = false;
    const syncButton = () => { button.textContent = video.paused ? 'Odtwórz wideo' : 'Wstrzymaj wideo'; };
    video.addEventListener('play', syncButton);
    video.addEventListener('pause', syncButton);
    button.addEventListener('click', () => {
      if (video.paused) {
        userPaused.delete(video);
        playVideo(video);
      } else {
        userPaused.add(video);
        video.pause();
      }
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target: video, isIntersecting }) => {
        if (isIntersecting && !reducedMotion && !userPaused.has(video)) playVideo(video);
        else video.pause();
      });
    }, { rootMargin: '160px 0px', threshold: 0 });
    videos.forEach(video => observer.observe(video));
  } else if (!reducedMotion) {
    videos.forEach(playVideo);
  }

  // Treść podglądu ze źródła; natywny dialog obsługuje fokus i Escape.
  const dialog = document.querySelector('.portfolio-lightbox');
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  document.querySelectorAll('.portfolio-thumb').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !dialog.showModal) return;
      event.preventDefault();
      title.textContent = link.querySelector('img').alt;
      image.src = link.href;
      image.alt = title.textContent;
      dialog.showModal();
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => image.removeAttribute('src'));
})();
