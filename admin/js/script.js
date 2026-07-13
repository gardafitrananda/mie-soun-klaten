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
// ============================================================
// DATA STATE (Data Awal Kosong, Akan Diisi dari Database)
// ============================================================
let products = [];
let testimonials = [];
let users = [
    { id: 1, name: 'Admin', email: 'admin@miesoun.shop', role: 'Administrator' }
];

let currentTab = 'products';
let editingId = null;

// ============================================================
// RENDER FUNCTIONS (Menampilkan Data ke Tabel)
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
            <td class="actions">
                <i class="fas fa-edit" onclick="editItem('products', ${p.id})"></i>
                <i class="fas fa-trash" onclick="deleteItem('products', ${p.id})"></i>
            </td>
        </tr>
    `}).join('');
}

function renderTestimonials() {
    const tbody = document.getElementById('testimonialsBody');
    if (!tbody) return;
    tbody.innerHTML = testimonials.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${t.name}</td>
            <td>${t.text.substring(0, 40)}${t.text.length > 40 ? '...' : ''}</td>
            <td><span style="color:#FFD166;">${'★'.repeat(t.rating)}</span></td>
            <td class="actions">
                <i class="fas fa-edit" onclick="editItem('testimonials', ${t.id})"></i>
                <i class="fas fa-trash" onclick="deleteItem('testimonials', ${t.id})"></i>
            </td>
        </tr>
    `).join('');
}

function renderUsers() {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td class="actions">
                <i class="fas fa-edit" onclick="editItem('users', ${u.id})"></i>
                <i class="fas fa-trash" onclick="deleteItem('users', ${u.id})"></i>
            </td>
        </tr>
    `).join('');
}

function renderAll() {
    renderProducts();
    renderTestimonials();
    renderUsers();
}

// ============================================================
// CRUD DELETE & EDIT
// ============================================================
async function deleteItem(tab, id) {
    if (!confirm('Hapus data ini secara permanen dari database?')) return;

    if (tab === 'products') {
        try {
            const response = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Produk berhasil dihapus!');
                location.reload();
            } else alert('Gagal menghapus produk.');
        } catch (err) { console.error(err); }
    } else if (tab === 'testimonials') {
        try {
            const response = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Testimoni berhasil dihapus!');
                location.reload();
            } else alert('Gagal menghapus testimoni.');
        } catch (err) { console.error(err); }
    }
}

function editItem(tab, id) {
    let data;
    if (tab === 'products') data = products.find(p => p.id === id);
    else if (tab === 'testimonials') data = testimonials.find(t => t.id === id);
    else if (tab === 'users') data = users.find(u => u.id === id);

    if (!data) return;
    editingId = id;
    openModal(tab, data);
}

// ============================================================
// MODAL & SIMPAN
// ============================================================
function openModal(tab, data = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    const isEdit = data !== null;

    title.textContent = isEdit ? 'Edit Data' : 'Tambah Data Baru';
    let html = '';

   if (tab === 'products') {
        html = `
            <div class="form-group"><label>Badge (Misal: 🔥 Terlaris)</label><input id="f_badge" value="${data?.badge || ''}" placeholder="Kosongkan jika tidak ada" /></div>
            <div class="form-group"><label>Nama Produk</label><input id="f_name" value="${data?.name || ''}" /></div>
            <div class="form-group"><label>Harga Jual Baru (Angka)</label><input id="f_price" type="number" value="${data?.price || ''}" /></div>
            <div class="form-group"><label>Harga Coret / Lama (Angka)</label><input id="f_old_price" type="number" value="${data?.old_price || ''}" placeholder="Kosongkan jika tidak diskon" /></div>
            <div class="form-group"><label>Deskripsi</label><textarea id="f_desc" rows="3">${data?.description || ''}</textarea></div>
            
            <!-- Fitur Upload Gambar -->
            <div class="form-group" style="background: #f9f9f9; padding: 1rem; border-radius: 8px; border: 1px dashed #ccc;">
                <label>Pilih / Ganti Foto Produk</label>
                <input type="file" id="f_upload" accept="image/*" onchange="previewImage(this)" style="margin-bottom:10px;" />
                
                <!-- Input ini disembunyikan, isinya akan otomatis terisi Base64 / URL gambar -->
                <input type="hidden" id="f_img" value="${data?.gambar_url || 'FOTO PRODUK/foto.jpg'}" />
                
                <div>
                    <img id="img_preview" src="${data?.gambar_url || 'FOTO PRODUK/foto.jpg'}" alt="Preview" style="max-width: 100%; height: auto; border-radius: 8px; max-height: 150px; object-fit: cover;">
                </div>
            </div>
        `;
    
    } else if (tab === 'testimonials') {
        html = `
            <div class="form-group"><label>Nama Pengguna</label><input id="f_testi_name" value="${data?.name || ''}" /></div>
            <div class="form-group"><label>Lokasi / Profesi (Contoh: 📍 Solo — Reseller)</label><input id="f_testi_loc" value="${data?.location || ''}" /></div>
            <div class="form-group"><label>Isi Testimoni</label><textarea id="f_testi_text" rows="3">${data?.text || ''}</textarea></div>
            <div class="form-group"><label>Rating Bintang (1-5)</label><input id="f_testi_rating" type="number" min="1" max="5" value="${data?.rating || 5}" /></div>
            <div class="form-group"><label>Inisial Avatar (Maks 2 Huruf)</label><input id="f_testi_init" value="${data?.avatar_initials || ''}" placeholder="Contoh: BS" /></div>
        `;
    }

    body.innerHTML = html;
    modal.classList.add('open');

    // EVENT SAAT TOMBOL SIMPAN DIKLIK
    document.getElementById('saveBtn').onclick = async function() {
        if (tab === 'products') {
            const payload = {
                badge: document.getElementById('f_badge').value,
                name: document.getElementById('f_name').value,
                price: document.getElementById('f_price').value,
                old_price: document.getElementById('f_old_price').value,
                description: document.getElementById('f_desc').value,
                gambar_url: document.getElementById('f_img').value
            };

            try {
                let url = '/api/products';
                let method = isEdit ? 'PUT' : 'POST';
                if (isEdit) payload.id = data.id;

                const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (response.ok) {
                    alert('Data Produk berhasil disimpan!');
                    location.reload();
                } else alert('Gagal menyimpan produk.');
            } catch (err) { console.error(err); }

        } else if (tab === 'testimonials') {
            const nameInput = document.getElementById('f_testi_name').value;
            const payload = {
                name: nameInput,
                location: document.getElementById('f_testi_loc').value,
                text: document.getElementById('f_testi_text').value,
                rating: parseInt(document.getElementById('f_testi_rating').value) || 5,
                avatar_initials: document.getElementById('f_testi_init').value || nameInput.substring(0, 2).toUpperCase(),
                avatar_bg: data?.avatar_bg || '#CE93D8',
                avatar_color: data?.avatar_color || '#4A148C'
            };

            try {
                let url = '/api/testimonials';
                let method = isEdit ? 'PUT' : 'POST';
                if (isEdit) payload.id = data.id;

                const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (response.ok) {
                    alert('Testimoni berhasil disimpan!');
                    location.reload();
                } else alert('Gagal menyimpan testimoni.');
            } catch (err) { console.error(err); }
        }
    };
}

function closeModal() {
    document.getElementById('modal').classList.remove('open');
}

// ============================================================
// NAVIGASI TAB MENU KIRI
// ============================================================
document.querySelectorAll('.sidebar nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');

        const tab = this.dataset.tab;
        currentTab = tab;

        document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
        document.getElementById('panel-' + tab).style.display = 'block';

        const titles = { products: 'Manajemen Produk', testimonials: 'Manajemen Testimoni', users: 'Manajemen User' };
        document.getElementById('pageTitle').textContent = titles[tab] || 'Dashboard';
        document.getElementById('btnAdd').style.display = tab === 'users' ? 'none' : 'inline-flex';
    });
});

document.getElementById('btnAdd').addEventListener('click', function() {
    editingId = null;
    openModal(currentTab, null);
});

// ============================================================
// INIT & FETCH DATA DARI DATABASE NEON
// ============================================================
async function fetchAllDataToAdmin() {
    try {
        const resProd = await fetch('/api/products');
        const jsonProd = await resProd.json();
        if (jsonProd.success) products = jsonProd.data;
        
        const resTesti = await fetch('/api/testimonials');
        const jsonTesti = await resTesti.json();
        if (jsonTesti.success) testimonials = jsonTesti.data;
        
        renderAll();
    } catch (err) {
        console.error("Gagal load data database:", err);
        renderAll(); 
    }
}

// Eksekusi penarikan data saat file dijalankan
fetchAllDataToAdmin();

// Toggle Sidebar untuk Mobile
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

if (menuToggle && overlay) {
    menuToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
window.deleteItem = deleteItem;
window.editItem = editItem;
window.closeModal = closeModal;

// ============================================================
// FUNGSI PREVIEW & CONVERT GAMBAR KE BASE64
// ============================================================
function previewImage(input) {
    const file = input.files[0];
    if (file) {
        // Cek ukuran file (Maks 1MB agar database tidak kepenuhan)
        if (file.size > 1024 * 1024) {
            alert('Ukuran gambar terlalu besar! Maksimal 1MB.');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            // Tampilkan gambar di layar
            document.getElementById('img_preview').src = e.target.result;
            // Masukkan data gambar ke input hidden untuk dikirim ke database
            document.getElementById('f_img').value = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}
// ============================================================
// FUNGSI PREVIEW & AUTO-COMPRESS GAMBAR (CANVAS API)
// ============================================================
function previewImage(input) {
    const file = input.files[0];
    if (!file) return;

    // Pastikan yang diupload benar-benar gambar
    if (!file.type.match(/image.*/)) {
        alert("File yang dipilih bukan gambar!");
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Tentukan batas maksimal lebar gambar (misal 800px sudah sangat cukup untuk web)
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;

            // Hitung rasio baru jika gambar aslinya lebih besar dari MAX_WIDTH
            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }

            // Buat elemen Canvas di memori (tidak terlihat di layar)
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // Gambar ulang foto asli ke dalam canvas dengan ukuran yang sudah dikecilkan
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Kompres gambar menjadi format JPEG dengan kualitas 70% (0.7)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

            // Tampilkan preview gambar yang sudah dikompres
            document.getElementById('img_preview').src = compressedBase64;
            
            // Masukkan data gambar hasil kompresi ke input hidden untuk dikirim ke API
            document.getElementById('f_img').value = compressedBase64;
        };
        // Masukkan hasil bacaan file ke dalam objek Image
        img.src = e.target.result;
    }
    
    // Baca file asli yang diunggah
    reader.readAsDataURL(file);
}