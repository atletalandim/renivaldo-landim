(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 701px)');
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-photo img');
  const motionSection = document.querySelector('.motion-section');
  const track = document.querySelector('.gallery-track');
  const closing = document.querySelector('.closing');
  const closingImage = document.querySelector('.closing-image img');
  const galleryProgress = document.querySelector('.gallery-progress i');
  const progress = document.querySelector('.reading-progress');
  const clamp = (v, min=0, max=1) => Math.min(max, Math.max(min, v));
  let pending = false;
  function paint() {
    pending = false;
    const y = window.scrollY;
    const height = window.innerHeight;
    progress.style.transform = `scaleX(${clamp(y / Math.max(1, root.scrollHeight - height))})`;
    if(reducedMotion.matches) return;
    hero.style.setProperty('--scroll-shade', String(clamp(y / hero.offsetHeight) * .2));
    heroImage.style.transform = `scale(${1 + clamp(y / hero.offsetHeight) * .13}) translateY(${clamp(y / hero.offsetHeight) * 2}%)`;
    if(desktop.matches) {
      const rect = motionSection.getBoundingClientRect();
      const fraction = clamp(-rect.top / Math.max(1, motionSection.offsetHeight - height));
      const distance = Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * .06);
      track.style.transform = `translateX(${-distance * fraction}px)`;
      galleryProgress.style.transform = `scaleX(${.05 + fraction * .95})`;
    } else { track.style.transform = ''; }
    const end = closing.getBoundingClientRect();
    const emphasis = clamp((height - end.top) / (height + end.height));
    closingImage.style.transform = `scale(${1 + emphasis * .13})`;
  }
  function requestPaint(){ if(!pending){ pending=true; requestAnimationFrame(paint); } }
  window.addEventListener('scroll', requestPaint, {passive:true});
  window.addEventListener('resize', requestPaint);
  reducedMotion.addEventListener('change', () => {
    [heroImage, closingImage, track].forEach(el=>el.style.transform='');
    hero.style.removeProperty('--scroll-shade');
    requestPaint();
  });
  if('IntersectionObserver' in window && !reducedMotion.matches) {
    root.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:.08});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  paint();
  const photoDialog = document.querySelector('#photo-dialog');
  const expanded = document.querySelector('#photo-expanded');
  const caption = document.querySelector('#photo-caption');
  document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{
    expanded.src = button.dataset.photo;
    expanded.alt = button.querySelector('img').alt;
    caption.textContent = button.dataset.caption;
    photoDialog.showModal();
  }));
  const proposalDialog = document.querySelector('#proposal-dialog');
  document.querySelector('#proposal-open').addEventListener('click',()=>proposalDialog.showModal());
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{
      const rect=dialog.getBoundingClientRect();
      if(event.target===dialog && (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)) dialog.close();
    });
  });
  document.querySelector('#proposal-form').addEventListener('submit',event=>{
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = `PROPOSTA DE PARCERIA — RENIVALDO LANDIM FERREIRA\n\nNome: ${data.get('name')}\nMarca ou empresa: ${data.get('brand')}\nContato: ${data.get('contact')}\nFormato: ${data.get('type')}\n\nIdeia de parceria\n${data.get('message')}\n\nResumo preparado para conversar com o atleta. Não representa um acordo ou envio automático.\n`;
    const url = URL.createObjectURL(new Blob(['\ufeff',text],{type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href=url;link.download='proposta-parceria-landim.txt';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
    document.querySelector('#proposal-status').textContent='Resumo gerado. Compartilhe o arquivo diretamente com o atleta para iniciar a conversa.';
  });
})();
