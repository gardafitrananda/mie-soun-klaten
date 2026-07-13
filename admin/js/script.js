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
            <div class="form-group"><label>URL Gambar (Contoh: FOTO PRODUK/foto.jpg)</label><input id="f_img" value="${data?.gambar_url || 'FOTO PRODUK/foto.jpg'}" /></div>
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