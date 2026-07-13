  // ============================================================
  //  KONFIGURASI 
  // ============================================================
  const NOMOR_WA = '6289504809915'; 
  const PESAN_WA = 'Halo kak, saya mau pesan Mie Soun Khas Klaten 😊 Boleh info produk dan harga?';
  const LINK_SHOPEE = 'https://id.shp.ee/WoVUhY53'; 
  // ============================================================

  function switchTab(tab) {
    const isWA = tab === 'wa';
    document.getElementById('steps-wa').style.display    = isWA ? 'grid' : 'none';
    document.getElementById('steps-shopee').style.display = isWA ? 'none' : 'grid';
    document.getElementById('cta-wa').style.display      = isWA ? 'block' : 'none';
    document.getElementById('cta-shopee').style.display  = isWA ? 'none' : 'block';
    document.getElementById('tab-wa').classList.toggle('active', isWA);
    document.getElementById('tab-shopee').classList.toggle('active', !isWA);
  }

  function bukaWA() {
    const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(PESAN_WA)}`;
    window.open(url, '_blank');
  }

  function bukaShopee() {
    window.open(LINK_SHOPEE, '_blank');
  }

  // Lightbox
  function openLightbox(el) {
    const img = el.querySelector('img');
    const label = el.querySelector('.overlay-label');
    const lb = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = img.src.replace(/w=\d+&h=\d+/, 'w=1200&h=800');
    document.getElementById('lightbox-img').alt = img.alt;
    document.getElementById('lightbox-caption').textContent = label ? label.textContent.replace('🔍 ','') : img.alt;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(e) {
    if (!e || e.target === document.getElementById('lightbox') || e.currentTarget.classList.contains('lightbox-close')) {
      document.getElementById('lightbox').classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Close with ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox({ target: document.getElementById('lightbox') });
  });

  // Scroll animation — safe version
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target && entry.target.style) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feat-card, .prod-card, .step-card, .testi-card, .gallery-item').forEach(el => {
    if (!el) return;
    try {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      observer.observe(el);
    } catch(e) { /* skip elemen bermasalah */ }
  });
