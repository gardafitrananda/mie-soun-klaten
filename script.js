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
async function loadContentFromDB() {
    try {
        const response = await fetch('/api/content');
        const json = await response.json();
        if (json.success && json.data) {
            const data = json.data;
            
            // Mengubah teks (pastikan ID-nya cocok dengan di index.html kamu)
            if(document.getElementById('lp_hero_title')) document.getElementById('lp_hero_title').innerText = data.hero_title;
            if(document.getElementById('lp_hero_subtitle')) document.getElementById('lp_hero_subtitle').innerText = data.hero_subtitle;
            if(document.getElementById('lp_about_text')) document.getElementById('lp_about_text').innerText = data.about_text;
            
            // Mengubah gambar latar Hero (Contoh jika hero pakai background-image di CSS)
            const heroSection = document.querySelector('.hero-section'); // Sesuaikan class section-nya
            if(document.getElementById('lp_hero_image') && data.hero_image) {
    document.getElementById('lp_hero_image').src = data.hero_image;
}
        }
    } catch (error) {
        console.error("Gagal mengambil konten utama:", error);
    }
}
async function renderWebContent() {
    try {
        const response = await fetch('/api/content');
        const json = await response.json();
        if (json.success && json.data) {
            const d = json.data;
            
            // Fungsi pintar agar web tidak rusak jika ada elemen ID yang belum terpasang
            const inject = (id, val) => { 
                const el = document.getElementById(id); 
                if(el && val) el.innerHTML = val; // pakai innerHTML agar <br> terbaca
            };

            inject('lp_hero_title', d.hero_title);
            inject('lp_hero_subtitle', d.hero_subtitle);
            inject('lp_about_text', d.about_text);
            
            const heroImg = document.getElementById('lp_hero_image');
            if(heroImg && d.hero_image) heroImg.src = d.hero_image;

            inject('lp_feat1_title', d.feat1_title); inject('lp_feat1_desc', d.feat1_desc);
            inject('lp_feat2_title', d.feat2_title); inject('lp_feat2_desc', d.feat2_desc);
            inject('lp_feat3_title', d.feat3_title); inject('lp_feat3_desc', d.feat3_desc);

            inject('lp_stat1_num', d.stat1_num); inject('lp_stat1_label', '<i class="fas fa-users" style="margin-right:4px;"></i> ' + d.stat1_label);
            inject('lp_stat2_num', d.stat2_num); inject('lp_stat2_label', '<i class="fas fa-calendar-alt" style="margin-right:4px;"></i> ' + d.stat2_label);
            inject('lp_stat3_num', d.stat3_num); inject('lp_stat3_label', '<i class="fas fa-map-marker-alt" style="margin-right:4px;"></i> ' + d.stat3_label);
            inject('lp_stat4_num', '<i class="fas fa-star" style="color:#FFD166;font-size:1.8rem;"></i> ' + d.stat4_num); 
            inject('lp_stat4_label', '<i class="fas fa-star" style="color:#FFD166;"></i> ' + d.stat4_label);
            
            inject('lp_sec_about_t', d.section_about_title); inject('lp_sec_about_s', d.section_about_sub);
            inject('lp_sec_feat_t', d.section_feat_title); inject('lp_sec_feat_s', d.section_feat_sub);
            inject('lp_sec_gal_t', '<i class="fas fa-images" style="color:#FF6B35;"></i> ' + d.section_gallery_title); inject('lp_sec_gal_s', d.section_gallery_sub);
            inject('lp_sec_prod_t', d.section_prod_title); inject('lp_sec_prod_s', d.section_prod_sub);
            inject('lp_sec_testi_t', '<i class="fas fa-star" style="color:#FFD166;"></i> ' + d.section_testi_title); inject('lp_sec_testi_s', d.section_testi_sub);
            
            inject('lp_trust1', d.trust1_text); inject('lp_trust2', d.trust2_text); inject('lp_trust3', d.trust3_text);
            inject('lp_trust4', d.trust4_text); inject('lp_trust5', d.trust5_text);

            inject('lp_cta_desc', d.cta_desc);
            inject('lp_footer_address', '<i class="fas fa-map-marker-alt"></i> ' + d.footer_address);
            inject('lp_footer_copy', '© ' + new Date().getFullYear() + ' ' + d.footer_copy);

            // Teks Badge Hero
            inject('lp_hb1_t', d.hero_badge1_text);
            inject('lp_hb2_t', d.hero_badge2_text);
            inject('lp_hb3_t', d.hero_badge3_text);

            // Ikon Badge Hero (Ubah class)
            if(document.getElementById('lp_hb1_i')) document.getElementById('lp_hb1_i').className = d.hero_badge1_icon;
            if(document.getElementById('lp_hb2_i')) document.getElementById('lp_hb2_i').className = d.hero_badge2_icon;
            if(document.getElementById('lp_hb3_i')) document.getElementById('lp_hb3_i').className = d.hero_badge3_icon;

            // Ikon Trustbar (Ubah class)
            if(document.getElementById('lp_tr1_i')) document.getElementById('lp_tr1_i').className = d.trust1_icon;
            if(document.getElementById('lp_tr2_i')) document.getElementById('lp_tr2_i').className = d.trust2_icon;
            if(document.getElementById('lp_tr3_i')) document.getElementById('lp_tr3_i').className = d.trust3_icon;
            if(document.getElementById('lp_tr4_i')) document.getElementById('lp_tr4_i').className = d.trust4_icon;
            if(document.getElementById('lp_tr5_i')) document.getElementById('lp_tr5_i').className = d.trust5_icon;
          }
    } catch (error) { console.error('Gagal memuat konten teks:', error); }
}

// Tambahkan panggilannya di event listener yang sudah ada:
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromDB();
    loadTestimonialsFromDB();
    loadGalleryFromDB();
    loadContentFromDB();
    renderWebContent();
});