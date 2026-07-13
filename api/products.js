import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 1. AMBIL SEMUA PRODUK (GET)
        if (req.method === 'GET') {
            const result = await sql`SELECT * FROM menu ORDER BY id ASC`;
            return res.status(200).json({ success: true, data: result.rows });
        }

        // 2. TAMBAH PRODUK BARU (POST)
        if (req.method === 'POST') {
            const { name, price, description, gambar_url } = req.body;
            
            // Konversi harga menjadi integer murni untuk DB
            const numericPrice = typeof price === 'string' 
                ? parseInt(price.replace(/[^0-9]/g, '')) 
                : parseInt(price);

            const result = await sql`
                INSERT INTO menu (nama_menu, harga, deskripsi, gambar_url) 
                VALUES (${name}, ${numericPrice}, ${description || ''}, ${gambar_url || 'FOTO PRODUK/foto.jpg'})
                RETURNING *
            `;
            
            return res.status(201).json({ success: true, data: result.rows[0] });
        }
        // 4. EDIT PRODUK (PUT)
        if (req.method === 'PUT') {
            const { id, name, price, description, gambar_url } = req.body;
            
            // Bersihkan format harga (misal "Rp 35.000" jadi 35000)
            const numericPrice = typeof price === 'string' 
                ? parseInt(price.replace(/[^0-9]/g, '')) 
                : parseInt(price);

            await sql`
                UPDATE menu 
                SET nama_menu = ${name}, harga = ${numericPrice}, deskripsi = ${description}, gambar_url = ${gambar_url}
                WHERE id = ${id}
            `;
            return res.status(200).json({ success: true, message: 'Produk berhasil diupdate' });
        }
        // 3. HAPUS PRODUK (DELETE)
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ success: false, error: 'ID required' });
            
            await sql`DELETE FROM menu WHERE id = ${id}`;
            return res.status(200).json({ success: true, message: 'Product deleted' });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error) {
        console.error('Products API error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}