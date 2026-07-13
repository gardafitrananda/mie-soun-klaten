import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const result = await sql`SELECT * FROM products ORDER BY id ASC`;
            return res.status(200).json({ success: true, data: result.rows });
        }

        if (req.method === 'POST') {
            const { name, price, old_price, description, gambar_url, badge } = req.body;
            
            const numericPrice = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, '')) : parseInt(price);
            const numericOldPrice = typeof old_price === 'string' ? parseInt(old_price.replace(/[^0-9]/g, '')) : parseInt(old_price || 0);

            const result = await sql`
                INSERT INTO products (name, price, old_price, description, gambar_url, badge) 
                VALUES (${name}, ${numericPrice}, ${numericOldPrice}, ${description || ''}, ${gambar_url || 'FOTO PRODUK/foto.jpg'}, ${badge || ''})
                RETURNING *
            `;
            return res.status(201).json({ success: true, data: result.rows[0] });
        }

        if (req.method === 'PUT') {
            const { id, name, price, old_price, description, gambar_url, badge } = req.body;
            
            const numericPrice = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, '')) : parseInt(price);
            const numericOldPrice = typeof old_price === 'string' ? parseInt(old_price.replace(/[^0-9]/g, '')) : parseInt(old_price || 0);

            await sql`
                UPDATE products 
                SET name = ${name}, price = ${numericPrice}, old_price = ${numericOldPrice}, description = ${description}, gambar_url = ${gambar_url}, badge = ${badge}
                WHERE id = ${id}
            `;
            return res.status(200).json({ success: true, message: 'Produk berhasil diupdate' });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ success: false, error: 'ID required' });
            await sql`DELETE FROM products WHERE id = ${id}`;
            return res.status(200).json({ success: true, message: 'Product deleted' });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}