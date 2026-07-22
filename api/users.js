const { sql } = require('@vercel/postgres');
// Endpoint untuk proses Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cari user di database Neon berdasarkan email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'User tidak ditemukan' });
        }

        const user = result.rows[0];

        // Cocokkan password
        // (Catatan: Ini pencocokan plain-text. Di dunia nyata sebaiknya menggunakan bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ success: false, error: 'Password salah' });
        }

        // Hapus password dari object sebelum dikirim kembali ke frontend (untuk keamanan)
        delete user.password;

        // Kirim respon sukses beserta data usernya
        res.json({ 
            success: true, 
            token: 'miesecret2026', 
            data: user 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' });
    }
});
module.exports = async function handler(req, res) {
    // Pengaturan CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

  try {
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