// ============================================================
// CEK AUTENTIKASI LOGIN
// ============================================================
if (localStorage.getItem('admin_token') !== 'miesecret2026') {
    window.location.href = '/admin/login.html';
}

function logoutAdmin() {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login.html';
}

let products = [], testimonials = [], users = [], gallery = [];
let currentTab = 'products';
let editingId = null;

// ============================================================
// FUNGSI AKTIVASI TAB (TANPA RELOAD)
// ============================================================
function activateTab(tab) {
    currentTab = tab;

    // Update menu sidebar
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.sidebar nav a[data-tab="${tab}"]`)?.classList.add('active');

    // Tampilkan panel yang sesuai
    document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    document.getElementById('panel-' + tab).style.display = 'block';

    // Update judul
    const titles = {
        products: 'Manajemen Produk',
        testimonials: 'Manajemen Testimoni',
        gallery: 'Manajemen Galeri',
        users: 'Manajemen User'
    };
    document.getElementById('pageTitle').textContent = titles[tab] || 'Dashboard';

    // Sembunyikan tombol tambah di tab users
    document.getElementById('btnAdd').style.display = tab === 'users' ? 'none' : 'inline-flex';

    // Simpan ke localStorage agar tab tetap aktif setelah refresh
    localStorage.setItem('admin_active_tab', tab);
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderProducts() {
    const tbody = document.getElementById('productsBody');
    if (!tbody) return;
    tbody.innerHTML = products.map(p => {
        const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
        return `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${formatRupiah(p.price)}</td>
            <td><span style="background:var(--orange);color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;">${p.badge || '-'}</span></td>
            <td class="actions"><i class="fas fa-edit" onclick="editItem('products', ${p.id})"></i> <i class="fas fa-trash" onclick="deleteItem('products', ${p.id})"></i></td>
        </tr>`
    }).join('');
}

function renderTestimonials() {
    const tbody = document.getElementById('testimonialsBody');
    if (!tbody) return;
    tbody.innerHTML = testimonials.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${t.name}</td>
            <td>${t.text.substring(0, 40)}${t.text.length > 40 ? '...' : ''}</td>
            <td><span style="color:#FFD166;">${'★'.repeat(t.rating || 0)}</span></td>
            <td class="actions"><i class="fas fa-edit" onclick="editItem('testimonials', ${t.id})"></i> <i class="fas fa-trash" onclick="deleteItem('testimonials', ${t.id})"></i></td>
        </tr>`
    ).join('');
}

function renderGallery() {
    const tbody = document.getElementById('galleryBody');
    if (!tbody) return;
    tbody.innerHTML = gallery.map(g => `
        <tr>
            <td>${g.id}</td>
            <td><img src="${g.image_url}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
            <td>${g.label}</td>
            <td><code>${g.css_class || 'Normal'}</code></td>
            <td class="actions"><i class="fas fa-edit" onclick="editItem('gallery', ${g.id})"></i> <i class="fas fa-trash" onclick="deleteItem('gallery', ${g.id})"></i></td>
        </tr>`
    ).join('');
}

function renderUsers() {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;
    users = [{ id: 1, name: 'Admin', email: 'admin@miesoun.shop', role: 'Administrator' }];
    tbody.innerHTML = users.map(u => `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td class="actions">-</td></tr>`).join('');
}

function renderAll() { renderProducts(); renderTestimonials(); renderGallery(); renderUsers(); }

// ============================================================
// CRUD (DELETE, EDIT, OPEN MODAL, SAVE)
// ============================================================
async function deleteItem(tab, id) {
    if (!confirm('Hapus data ini permanen?')) return;
    try {
        const response = await fetch(`/api/${tab}?id=${id}`, { method: 'DELETE' });
        if (response.ok) { 
            alert('Berhasil dihapus!');
            // Refresh data tanpa reload halaman
            await fetchAllDataToAdmin();
            // Aktifkan tab yang sedang aktif
            activateTab(currentTab);
        }
    } catch (err) { console.error(err); }
}

function editItem(tab, id) {
    let data;
    if (tab === 'products') data = products.find(p => p.id === id);
    else if (tab === 'testimonials') data = testimonials.find(t => t.id === id);
    else if (tab === 'gallery') data = gallery.find(g => g.id === id);
    
    if (data) { editingId = id; openModal(tab, data); }
}

function openModal(tab, data = null) {
    const modal = document.getElementById('modal');
    const isEdit = data !== null;
    document.getElementById('modalTitle').textContent = isEdit ? 'Edit Data' : 'Tambah Data Baru';
    let html = '';

    if (tab === 'products') {
        html = `
            <div class="form-group"><label>Badge (Misal: 🔥 Terlaris)</label><input id="f_badge" value="${data?.badge || ''}" /></div>
            <div class="form-group"><label>Nama Produk</label><input id="f_name" value="${data?.name || ''}" /></div>
            <div class="form-group"><label>Harga Jual Baru</label><input id="f_price" type="number" value="${data?.price || ''}" /></div>
            <div class="form-group"><label>Harga Coret</label><input id="f_old_price" type="number" value="${data?.old_price || ''}" /></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="f_desc" rows="3">${data?.description || ''}</textarea></div>
            <div class="form-group"><label>Link Shopee Spesifik (Opsional)</label><input id="f_shopee" value="${data?.shopee_link || ''}" placeholder="Kosongkan untuk pakai link toko utama" /></div>
            <div class="form-group" style="background:#f9f9f9; padding:1rem; border-radius:8px; border:1px dashed #ccc;">
                <label>Foto Produk (Max 1MB Otomatis Kompres)</label>
                <input type="file" accept="image/*" onchange="previewImage(this)" style="margin-bottom:10px;" />
                <input type="hidden" id="f_img" value="${data?.gambar_url || 'FOTO PRODUK/foto.jpg'}" />
                <div><img id="img_preview" src="${data?.gambar_url || 'FOTO PRODUK/foto.jpg'}" style="max-height:100px; border-radius:5px;"></div>
            </div>`;
    } else if (tab === 'testimonials') {
        html = `
            <div class="form-group"><label>Nama</label><input id="f_testi_name" value="${data?.name || ''}" /></div>
            <div class="form-group"><label>Lokasi (Misal: 📍 Solo)</label><input id="f_testi_loc" value="${data?.location || ''}" /></div>
            <div class="form-group"><label>Testimoni</label><textarea id="f_testi_text" rows="3">${data?.text || ''}</textarea></div>
            <div class="form-group"><label>Rating (1-5)</label><input id="f_testi_rating" type="number" max="5" value="${data?.rating || 5}" /></div>
            <div class="form-group"><label>Inisial Avatar</label><input id="f_testi_init" value="${data?.avatar_initials || ''}" /></div>`;
    } else if (tab === 'gallery') {
        html = `
            <div class="form-group"><label>Label Teks Overlay (Misal: 🔍 Proses Masak)</label><input id="f_gal_label" value="${data?.label || ''}" /></div>
            <div class="form-group"><label>Teks Alt (SEO)</label><input id="f_gal_alt" value="${data?.alt_text || ''}" /></div>
            <div class="form-group">
                <label>Ukuran Layout (Grid)</label>
                <select id="f_gal_class" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc;">
                    <option value="" ${data?.css_class === '' ? 'selected' : ''}>Normal (Kecil)</option>
                    <option value="featured" ${data?.css_class === 'featured' ? 'selected' : ''}>Featured (Besar Kiri)</option>
                    <option value="tall" ${data?.css_class === 'tall' ? 'selected' : ''}>Tall (Tinggi Kanan)</option>
                </select>
            </div>
            <div class="form-group" style="background:#f9f9f9; padding:1rem; border-radius:8px; border:1px dashed #ccc;">
                <label>Foto Galeri (Otomatis Kompres)</label>
                <input type="file" accept="image/*" onchange="previewImage(this)" style="margin-bottom:10px;" />
                <input type="hidden" id="f_img" value="${data?.image_url || ''}" />
                <div><img id="img_preview" src="${data?.image_url || ''}" style="max-height:100px; border-radius:5px;"></div>
            </div>`;
    }

    document.getElementById('modalBody').innerHTML = html;
    modal.classList.add('open');

    document.getElementById('saveBtn').onclick = async function() {
        let payload = {};
        if (tab === 'products') {
            payload = {
                badge: document.getElementById('f_badge').value, name: document.getElementById('f_name').value,
                price: document.getElementById('f_price').value, old_price: document.getElementById('f_old_price').value,
                description: document.getElementById('f_desc').value, gambar_url: document.getElementById('f_img').value,
                shopee_link: document.getElementById('f_shopee').value
            };
        } else if (tab === 'testimonials') {
            payload = {
                name: document.getElementById('f_testi_name').value, location: document.getElementById('f_testi_loc').value,
                text: document.getElementById('f_testi_text').value, rating: document.getElementById('f_testi_rating').value,
                avatar_initials: document.getElementById('f_testi_init').value
            };
        } else if (tab === 'gallery') {
            if(!document.getElementById('f_img').value) return alert('Pilih foto galeri terlebih dahulu!');
            payload = {
                label: document.getElementById('f_gal_label').value, alt_text: document.getElementById('f_gal_alt').value,
                css_class: document.getElementById('f_gal_class').value, image_url: document.getElementById('f_img').value
            };
        }

        if (isEdit) payload.id = data.id;
        
        try {
            const response = await fetch(`/api/${tab}`, { 
                method: isEdit ? 'PUT' : 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(payload) 
            });
            if (response.ok) { 
                alert('Berhasil disimpan!'); 
                closeModal();
                // Refresh data tanpa reload halaman
                await fetchAllDataToAdmin();
                // Aktifkan tab yang sedang aktif (tetap di tab yang sama)
                activateTab(currentTab);
            }
        } catch (err) { console.error(err); }
    };
}

function closeModal() { document.getElementById('modal').classList.remove('open'); }

// ============================================================
// IMAGE COMPRESSOR & INIT
// ============================================================
function previewImage(input) {
    const file = input.files[0];
    if (!file || !file.type.match(/image.*/)) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const MAX_WIDTH = 800; let width = img.width; let height = img.height;
            if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
            const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            document.getElementById('img_preview').src = compressed;
            document.getElementById('f_img').value = compressed;
        };
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

// ============================================================
// SIDEBAR NAVIGATION (Pakai activateTab)
// ============================================================
document.querySelectorAll('.sidebar nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const tab = this.dataset.tab;
        activateTab(tab);
    });
});

// ============================================================
// TOMBOL TAMBAH
// ============================================================
document.getElementById('btnAdd').addEventListener('click', () => { editingId = null; openModal(currentTab, null); });

// ============================================================
// ESC UNTUK TUTUP MODAL
// ============================================================
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ============================================================
// FETCH DATA DARI API
// ============================================================
async function fetchAllDataToAdmin() {
    try {
        const [resP, resT, resG] = await Promise.all([fetch('/api/products'), fetch('/api/testimonials'), fetch('/api/gallery')]);
        if (resP.ok) products = (await resP.json()).data;
        if (resT.ok) testimonials = (await resT.json()).data;
        if (resG.ok) gallery = (await resG.json()).data;
        renderAll();
    } catch (err) { console.error(err); renderAll(); }
}

// ============================================================
// INIT — BACA TAB TERAKHIR DARI localStorage
// ============================================================
(async function init() {
    // Ambil tab terakhir yang disimpan, default 'products'
    const savedTab = localStorage.getItem('admin_active_tab') || 'products';
    // Aktifkan tab tersebut
    activateTab(savedTab);
    // Ambil data dari API
    await fetchAllDataToAdmin();
    // Pastikan tombol tambah sesuai dengan tab
    document.getElementById('btnAdd').style.display = savedTab === 'users' ? 'none' : 'inline-flex';
})();