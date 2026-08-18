const lightbox = document.getElementById('lightbox');
const lightboxVisual = document.getElementById('lightbox-visual');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxImage = document.getElementById('lightbox-image');
const closeButton = document.querySelector('.lightbox-close');
const backdrop = document.querySelector('.lightbox-backdrop');
const cards = document.querySelectorAll('.thumb-card');

function openLightbox(title, imageSrc) {
  lightboxTitle.textContent = title;
  lightboxVisual.className = 'lightbox-visual';
  if (lightboxImage) {
    lightboxImage.src = imageSrc;
    lightboxImage.alt = title;
  }
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lightboxImage) {
    lightboxImage.removeAttribute('src');
  }
}

cards.forEach((card) => {
  card.addEventListener('click', () => {
    const { title, image } = card.dataset;
    openLightbox(title, image);
  });
});

closeButton.addEventListener('click', closeLightbox);
backdrop.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
    closeLightbox();
  }
});

// Zapewnia start wyciszonego wideo także w przeglądarkach,
// które bardziej restrykcyjnie traktują autoplay.
const showcaseVideo = document.querySelector('.showcase-video');
if (showcaseVideo) {
  showcaseVideo.muted = true;
  showcaseVideo.playsInline = true;
  showcaseVideo.play().catch(() => {});
}

// Akordeon „Dlaczego warto” — otwarty może być tylko jeden box naraz.
const accordion = document.querySelector('[data-accordion]');

if (accordion) {
  const accordionItems = [...accordion.querySelectorAll('.accordion-item')];

  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');

    trigger.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');

      accordionItems.forEach((otherItem) => {
        otherItem.classList.remove('is-open');
        otherItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// Delikatne wejście całej sekcji po przewinięciu do niej.
const revealItems = document.querySelectorAll('.reveal-on-scroll');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}
