const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'POST' || req.method === 'PUT') {
            const { id, image_url, alt_text, label, css_class } = req.body;
            
            if (req.method === 'POST') {
                const result = await sql`
                    INSERT INTO gallery (image_url, alt_text, label, css_class) 
                    VALUES (${image_url}, ${alt_text || ''}, ${label || ''}, ${css_class || ''})
                    RETURNING *
                `;
                return res.status(201).json({ success: true, data: result.rows[0] });
            } else {
                await sql`
                    UPDATE gallery 
                    SET image_url = ${image_url}, alt_text = ${alt_text}, label = ${label}, css_class = ${css_class}
                    WHERE id = ${id}
                `;
                return res.status(200).json({ success: true, message: 'Galeri diupdate' });
            }
        }
        
        if (req.method === 'GET') {
            const result = await sql`SELECT * FROM gallery ORDER BY id ASC`;
            return res.status(200).json({ success: true, data: result.rows });
        }
        
        if (req.method === 'DELETE') {
            const { id } = req.query;
            await sql`DELETE FROM gallery WHERE id = ${id}`;
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};