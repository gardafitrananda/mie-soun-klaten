const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    // Pengaturan CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method tidak diizinkan' });
    }

    try {
        // Query untuk menghitung total data menggunakan agregasi COUNT
        // Pastikan nama tabel ('users', 'products', 'testimonials') sesuai dengan yang ada di database-mu
        const totalUsers = await sql`SELECT COUNT(*) as count FROM users`;
        
        // Asumsi kamu punya tabel products dan testimonials, jika namanya berbeda, ubah query ini:
        const totalProducts = await sql`SELECT COUNT(*) as count FROM products`;
        const totalTestimoni = await sql`SELECT COUNT(*) as count FROM testimonials`;

        // Mengirimkan hasil perhitungan ke frontend
        return res.status(200).json({
            success: true,
            data: {
                users: totalUsers.rows[0].count,
                products: totalProducts.rows[0].count,
                testimonials: totalTestimoni.rows[0].count
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};