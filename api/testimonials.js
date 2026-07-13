const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const result = await sql`SELECT * FROM testimonials ORDER BY id ASC`;
            return res.status(200).json({ success: true, data: result.rows });
        }

        if (req.method === 'POST') {
            const { name, location, text, rating, avatar_initials, avatar_bg, avatar_color } = req.body;
            const result = await sql`
                INSERT INTO testimonials (name, location, text, rating, avatar_initials, avatar_bg, avatar_color)
                VALUES (${name}, ${location}, ${text}, ${parseInt(rating) || 5}, ${avatar_initials || 'U'}, ${avatar_bg || '#FFD54F'}, ${avatar_color || '#E65100'})
                RETURNING *
            `;
            return res.status(201).json({ success: true, data: result.rows[0] });
        }

        if (req.method === 'PUT') {
            const { id, name, location, text, rating, avatar_initials, avatar_bg, avatar_color } = req.body;
            await sql`
                UPDATE testimonials 
                SET name = ${name}, location = ${location}, text = ${text}, rating = ${parseInt(rating) || 5}, 
                    avatar_initials = ${avatar_initials}, avatar_bg = ${avatar_bg}, avatar_color = ${avatar_color}
                WHERE id = ${id}
            `;
            return res.status(200).json({ success: true, message: 'Testimoni berhasil diupdate' });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ success: false, error: 'ID required' });
            await sql`DELETE FROM testimonials WHERE id = ${id}`;
            return res.status(200).json({ success: true, message: 'Testimoni berhasil dihapus' });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error) {
        console.error('Testimonials API error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};