const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            // Selalu ambil id = 1 karena cuma ada 1 halaman setting
            const result = await sql`SELECT * FROM page_content WHERE id = 1`;
            return res.status(200).json({ success: true, data: result.rows[0] });
        }
        
        if (req.method === 'PUT') {
            const { hero_title, hero_subtitle, hero_image, about_text } = req.body;
            await sql`
                UPDATE page_content 
                SET hero_title = ${hero_title}, hero_subtitle = ${hero_subtitle}, hero_image = ${hero_image}, about_text = ${about_text}
                WHERE id = 1
            `;
            return res.status(200).json({ success: true, message: 'Konten berhasil diupdate' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};