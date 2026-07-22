const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    // Pengaturan CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // --- 0. PROSES LOGIN ADMIN ---
        // Karena form login menembak /api/login, kita tangkap aksi POST dengan parameter khusus atau buat file terpisah. 
        // Tapi cara paling mudah di Vercel: kita buat file khusus login.js atau tangkap di sini.
        // *Saran terbaik*: Lebih bersih kita buat file baru api/login.js. 
        
        // --- 1. TAMPILKAN DATA (READ) ---
        if (req.method === 'GET') {
            const result = await sql`SELECT id, name, email, role, created_at FROM users ORDER BY id ASC`;
            return res.status(200).json({ success: true, data: result.rows });
        }

        // --- 2. TAMBAH DATA (CREATE) ---
        if (req.method === 'POST') {
            const { name, email, role, password } = req.body;
            await sql`
                INSERT INTO users (name, email, role, password) 
                VALUES (${name}, ${email}, ${role}, ${password})
            `;
            return res.status(201).json({ success: true, message: 'User berhasil ditambahkan' });
        }

        // --- 3. EDIT DATA (UPDATE) ---
        if (req.method === 'PUT') {
            const { id, name, email, role, password } = req.body;
            if (password && password.trim() !== '') {
                await sql`UPDATE users SET name = ${name}, email = ${email}, role = ${role}, password = ${password} WHERE id = ${id}`;
            } else {
                await sql`UPDATE users SET name = ${name}, email = ${email}, role = ${role} WHERE id = ${id}`;
            }
            return res.status(200).json({ success: true, message: 'User berhasil diupdate' });
        }

        // --- 4. HAPUS DATA (DELETE) ---
        if (req.method === 'DELETE') {
            const { id } = req.body;
            await sql`DELETE FROM users WHERE id = ${id}`;
            return res.status(200).json({ success: true, message: 'User berhasil dihapus' });
        }

        return res.status(405).json({ error: 'Method tidak diizinkan' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};