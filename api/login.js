const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method tidak diizinkan' });
    }

    const { name, password } = req.body;

    try {
        // Cari user di database Neon berdasarkan kolom name
        const result = await sql`SELECT * FROM users WHERE name = ${name}`;

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'User tidak ditemukan' });
        }

        const user = result.rows[0];

        // Cocokkan password
        if (user.password !== password) {
            return res.status(401).json({ success: false, error: 'Password salah' });
        }

        // Hapus password sebelum dikirim ke frontend
        delete user.password;

        return res.status(200).json({
            success: true,
            token: 'miesecret2026',
            data: user
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};