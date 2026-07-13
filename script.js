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
// ============================================================
// INTEGRASI DATABASE (Fetch dari API Vercel)
// ============================================================

// 1. Fungsi Mengambil Produk
async function loadProductsFromDB() {
  try {
    const response = await fetch('/api/products');
    const json = await response.json();
    
    if (json.success && json.data.length > 0) {
      const container = document.querySelector('.products');
      container.innerHTML = ''; 
      
      json.data.forEach(prod => {
        const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
        const hargaRupiah = formatRupiah(prod.price);
        
        const hargaCoretHTML = prod.old_price > 0 ? `<span class="prod-price-old">${formatRupiah(prod.old_price)}</span>` : '';
        const badgeHTML = prod.badge ? `<div class="prod-badge">${prod.badge}</div>` : '';
        
        const linkProdukIni = prod.shopee_link ? prod.shopee_link : LINK_SHOPEE;

        const cardHTML = `
          <div class="prod-card" style="opacity:1; transform:translateY(0)">
            ${badgeHTML}
            <div class="prod-img-wrap">
              <img src="${prod.gambar_url}" alt="${prod.name}" loading="lazy" onerror="this.style.opacity='0'">
            </div>
            <div class="prod-info">
              <h3>${prod.name}</h3>
              <p>${prod.description}</p>
              <div class="prod-footer">
                <div>
                  <span class="prod-price">${hargaRupiah}</span>
                  ${hargaCoretHTML}
                </div>
                <div style="display:flex;gap:.4rem">
                  <button class="btn-buy" onclick="window.open('${linkProdukIni}', '_blank')"><i class="fas fa-bag-shopping"></i> Shopee</button>
                  <button class="btn-buy btn-buy-wa" onclick="bukaWA()"><i class="fab fa-whatsapp"></i> WA</button>
                </div>
              </div>
            </div>
          </div>
        `;
        container.innerHTML += cardHTML;
      });
    }
  } catch (error) {
    console.error("Gagal mengambil data produk dari database:", error);
  }
}

// 2. Fungsi Mengambil Testimoni
async function loadTestimonialsFromDB() {
  try {
    const response = await fetch('/api/testimonials');
    const json = await response.json();
    
    if (json.success && json.data.length > 0) {
      const container = document.querySelector('.testimonials');
      container.innerHTML = ''; 
      
      json.data.forEach(t => {
        const stars = '★'.repeat(t.rating || 5);
        
        container.innerHTML += `
          <div class="testi-card" style="opacity:1; transform:translateY(0)">
            <div class="testi-stars" style="color:#FFD166; font-size:1.2rem; margin-bottom:0.5rem;">${stars}</div>
            <p class="testi-text">"${t.text}"</p>
            <div class="testi-author">
              <div class="avatar" style="background:${t.avatar_bg || '#FFD54F'}; color:${t.avatar_color || '#E65100'}">${t.avatar_initials || 'U'}</div>
              <div>
                <div class="testi-name">${t.name}</div>
                <div class="testi-loc"><i class="fas fa-map-marker-alt"></i> ${t.location || 'Pelanggan Setia'}</div>
              </div>
            </div>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error("Gagal mengambil data testimoni database:", error);
  }
}

// 3. Fungsi Mengambil Galeri
async function loadGalleryFromDB() {
  try {
    const response = await fetch('/api/gallery');
    const json = await response.json();
    
    if (json.success && json.data.length > 0) {
      const container = document.querySelector('.gallery-grid');
      container.innerHTML = ''; 
      
      json.data.forEach(g => {
        container.innerHTML += `
          <div class="gallery-item ${g.css_class || ''}" onclick="openLightbox(this)">
            <img src="${g.image_url}" alt="${g.alt_text}" loading="lazy">
            <div class="overlay">
              <span class="overlay-label">${g.label}</span>
            </div>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error("Gagal mengambil data galeri database:", error);
  }
}

// 4. Jalankan Ketiga fungsi SETELAH seluruh halaman (DOM) selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromDB();
    loadTestimonialsFromDB();
    loadGalleryFromDB(); 
});