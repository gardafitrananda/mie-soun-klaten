// ============================================================
// DATA MOCK
// ============================================================
let products = [
    { id: 1, name: 'Mie Soun Cap Bintang 1Kg', price: 'Rp 34.595', stock: 45 },
    { id: 2, name: 'Mie Soun Cap Pandawa 2Kg', price: 'Rp 90.862', stock: 30 },
    { id: 3, name: 'Mie Soun Cap Rajawali 1Kg', price: 'Rp 85.000', stock: 22 },
];

let posts = [
    { id: 1, title: 'Sejarah Mie Soun Klaten', status: 'published', date: '2026-07-08' },
    { id: 2, title: 'Cara Memasak Soun Sempurna', status: 'draft', date: '2026-07-06' },
    { id: 3, title: 'Manfaat Pati Aren', status: 'published', date: '2026-07-04' },
];

let testimonials = [
    { id: 1, name: 'Andi', text: 'Sounnya kenyal dan enak!', rating: 5 },
    { id: 2, name: 'Budi', text: 'Cocok untuk tumisan.', rating: 4 },
];

let users = [
    { id: 1, name: 'Admin', email: 'admin@miesoun.shop', role: 'Administrator' },
    { id: 2, name: 'Editor', email: 'editor@miesoun.shop', role: 'Editor' },
];

// ============================================================
// STATE
// ============================================================
let currentTab = 'products';
let editingId = null;

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderProducts() {
    const tbody = document.getElementById('productsBody');
    if (!tbody) return;
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.stock}</td>
            <td class="actions">
                <i class="fas fa-edit" onclick="editItem('products', ${p.id})"></i>
                <i class="fas fa-trash" onclick="deleteItem('products', ${p.id})"></i>
            </td>
        </tr>
    `).join('');
}

function renderPosts() {
    const tbody = document.getElementById('postsBody');
    if (!tbody) return;
    tbody.innerHTML = posts.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td><span class="status ${p.status}">${p.status}</span></td>
            <td>${p.date}</td>
            <td class="actions">
                <i class="fas fa-edit" onclick="editItem('posts', ${p.id})"></i>
                <i class="fas fa-trash" onclick="deleteItem('posts', ${p.id})"></i>
            </td>
        </tr>
    `).join('');
}

function renderTestimonials() {
    const tbody = document.getElementById('testimonialsBody');
    if (!tbody) return;
    tbody.innerHTML = testimonials.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${t.name}</td>
            <td>${t.text.substring(0, 40)}${t.text.length > 40 ? '...' : ''}</td>
            <td>${'★'.repeat(t.rating)}</td>
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
    renderPosts();
    renderTestimonials();
    renderUsers();
}

// ============================================================
// CRUD OPERATIONS (MOCK)
// ============================================================
async function deleteItem(tab, id) {
    if (!confirm('Hapus data ini dari database?')) return;

    if (tab === 'products') {
        try {
            const response = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Produk berhasil dihapus!');
                location.reload();
            } else {
                alert('Gagal menghapus produk.');
            }
        } catch (err) {
            console.error(err);
        }
    }
}


function editItem(tab, id) {
    let data;
    if (tab === 'products') data = products.find(p => p.id === id);
    else if (tab === 'posts') data = posts.find(p => p.id === id);
    else if (tab === 'testimonials') data = testimonials.find(t => t.id === id);
    else if (tab === 'users') data = users.find(u => u.id === id);

    if (!data) return;
    editingId = id;
    openModal(tab, data);
}

// ============================================================
// MODAL
// ============================================================
function openModal(tab, data = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    const isEdit = data !== null;

    title.textContent = isEdit ? 'Edit' : 'Tambah';

    let html = '';

    if (tab === 'products') {
        html = `
            <div class="form-group"><label>Nama Produk</label><input id="f_name" value="${data?.name || ''}" /></div>
            <div class="form-group"><label>Harga</label><input id="f_price" value="${data?.price || ''}" /></div>
            <div class="form-group"><label>Stok</label><input id="f_stock" type="number" value="${data?.stock || 0}" /></div>
        `;
    } else if (tab === 'posts') {
        html = `
            <div class="form-group"><label>Judul</label><input id="f_title" value="${data?.title || ''}" /></div>
            <div class="form-group"><label>Status</label>
                <select id="f_status">
                    <option value="draft" ${data?.status === 'draft' ? 'selected' : ''}>Draft</option>
                    <option value="published" ${data?.status === 'published' ? 'selected' : ''}>Published</option>
                    <option value="archived" ${data?.status === 'archived' ? 'selected' : ''}>Archived</option>
                </select>
            </div>
            <div class="form-group"><label>Tanggal</label><input id="f_date" type="date" value="${data?.date || ''}" /></div>
        `;
    } else if (tab === 'testimonials') {
        html = `
            <div class="form-group"><label>Nama</label><input id="f_name" value="${data?.name || ''}" /></div>
            <div class="form-group"><label>Testimoni</label><textarea id="f_text">${data?.text || ''}</textarea></div>
            <div class="form-group"><label>Rating (1-5)</label><input id="f_rating" type="number" min="1" max="5" value="${data?.rating || 5}" /></div>
        `;
    } else if (tab === 'users') {
        html = `
            <div class="form-group"><label>Nama</label><input id="f_name" value="${data?.name || ''}" /></div>
            <div class="form-group"><label>Email</label><input id="f_email" value="${data?.email || ''}" /></div>
            <div class="form-group"><label>Role</label>
                <select id="f_role">
                    <option value="Administrator" ${data?.role === 'Administrator' ? 'selected' : ''}>Admin</option>
                    <option value="Editor" ${data?.role === 'Editor' ? 'selected' : ''}>Editor</option>
                </select>
            </div>
        `;
    }

    body.innerHTML = html;
    modal.classList.add('open');

// Event save
    document.getElementById('saveBtn').onclick = async function() {
        let payload = {};

        if (tab === 'products') {
            payload = {
                name: document.getElementById('f_name').value,
                price: document.getElementById('f_price').value,
                stock: parseInt(document.getElementById('f_stock').value) || 0,
                description: 'Soun klasik kenyal cocok untuk kuliner keluarga.', // default deskripsi form admin
                gambar_url: 'FOTO PRODUK/foto.jpg' // default gambar form admin
            };

            try {
                // Tembak API POST untuk menambah ke database Neon
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    alert('Produk berhasil disimpan ke database!');
                    location.reload(); // Segarkan dashboard untuk mengambil data terbaru
                } else {
                    alert('Gagal menyimpan produk.');
                }
            } catch (err) {
                console.error(err);
                alert('Terjadi kesalahan jaringan.');
            }
        }
        
        // Logika untuk tab artikel/testimoni tiruan (mock) tetap dibiarkan di bawah jika diperlukan
        closeModal();
    };

}

function closeModal() {
    document.getElementById('modal').classList.remove('open');
}

// ============================================================
// NAVIGASI TAB
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

        const titles = {
            products: 'Manajemen Produk',
            posts: 'Manajemen Artikel',
            testimonials: 'Manajemen Testimoni',
            users: 'Manajemen User'
        };
        document.getElementById('pageTitle').textContent = titles[tab] || 'Dashboard';

        // Sembunyikan tombol tambah di tab users
        document.getElementById('btnAdd').style.display = tab === 'users' ? 'none' : 'inline-flex';
    });
});

// ============================================================
// TOMBOL TAMBAH
// ============================================================
document.getElementById('btnAdd').addEventListener('click', function() {
    editingId = null;
    openModal(currentTab, null);
});

// ============================================================
// SEARCH (filter untuk produk)
// ============================================================
document.getElementById('searchInput').addEventListener('input', function() {
    const q = this.value.toLowerCase();

    if (currentTab === 'products') {
        const filtered = products.filter(p => p.name.toLowerCase().includes(q));
        const tbody = document.getElementById('productsBody');
        tbody.innerHTML = filtered.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.price}</td>
                <td>${p.stock}</td>
                <td class="actions">
                    <i class="fas fa-edit" onclick="editItem('products', ${p.id})"></i>
                    <i class="fas fa-trash" onclick="deleteItem('products', ${p.id})"></i>
                </td>
            </tr>
        `).join('');
    }
});

// ============================================================
// MOBILE SIDEBAR TOGGLE
// ============================================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

menuToggle.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

// ============================================================
// INIT
// ============================================================
renderAll();
document.getElementById('btnAdd').style.display = 'inline-flex';

// Close modal dengan ESC
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

// ============================================================
// EXPOSE GLOBAL FUNGSI (untuk inline onclick)
// ============================================================
window.deleteItem = deleteItem;
window.editItem = editItem;
window.closeModal = closeModal;
async function fetchProductsToAdmin() {
    try {
        const response = await fetch('/api/products');
        const json = await response.json();
        if (json.success) {
            products = json.data; // Timpa array mock dengan data asli database
            renderProducts();
        }
    } catch (err) {
        console.error("Gagal memuat data ke dashboard admin:", err);
    }
}
// Jalankan sesaat setelah script dimuat
fetchProductsToAdmin();