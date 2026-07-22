const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    // Pengaturan CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

   try {
            if (req.method === 'GET') {
                // Ambil data user, tapi JANGAN sertakan password untuk keamanan
                const result = await sql`SELECT id, name, email, role, created_at FROM users ORDER BY id ASC`;
                
                return res.status(200).json({
                    success: true,
                    data: result.rows
                });
            }

            // --- TAMBAHKAN BLOK INI UNTUK MENANGANI UPDATE (PUT) ---
            if (req.method === 'PUT') {
                const { id, name, email, role, password } = req.body;

                // Jika password diisi (user ingin ganti password)
                if (password && password.trim() !== '') {
                    await sql`UPDATE users SET name = ${name}, email = ${email}, role = ${role}, password = ${password} WHERE id = ${id}`;
                } 
                // Jika password dikosongkan (hanya update nama/email/role)
                else {
                    await sql`UPDATE users SET name = ${name}, email = ${email}, role = ${role} WHERE id = ${id}`;
                }

                return res.status(200).json({
                    success: true,
                    message: 'User berhasil diupdate'
                });
            }

            return res.status(405).json({ error: 'Method tidak diizinkan' });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
};