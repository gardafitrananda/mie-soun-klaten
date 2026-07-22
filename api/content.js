const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const result = await sql`SELECT * FROM page_content WHERE id = 1`;
            return res.status(200).json({ success: true, data: result.rows[0] });
        }

        if (req.method === 'PUT') {
            const { 
                hero_title, hero_subtitle, about_text, hero_image,
                feat1_title, feat1_desc, feat2_title, feat2_desc, feat3_title, feat3_desc,
                stat1_num, stat1_label, stat2_num, stat2_label, stat3_num, stat3_label, stat4_num, stat4_label,
                cta_desc, footer_address, footer_copy,
                // TAMBAHAN BARU
                section_about_title, section_about_sub, section_feat_title, section_feat_sub,
                section_gallery_title, section_gallery_sub, section_prod_title, section_prod_sub,
                section_testi_title, section_testi_sub,
                trust1_text, trust2_text, trust3_text, trust4_text, trust5_text
            } = req.body;

            await sql`
                UPDATE page_content 
                SET 
                    hero_title = ${hero_title}, hero_subtitle = ${hero_subtitle}, about_text = ${about_text}, hero_image = ${hero_image},
                    feat1_title = ${feat1_title}, feat1_desc = ${feat1_desc}, feat2_title = ${feat2_title}, feat2_desc = ${feat2_desc}, feat3_title = ${feat3_title}, feat3_desc = ${feat3_desc},
                    stat1_num = ${stat1_num}, stat1_label = ${stat1_label}, stat2_num = ${stat2_num}, stat2_label = ${stat2_label}, stat3_num = ${stat3_num}, stat3_label = ${stat3_label}, stat4_num = ${stat4_num}, stat4_label = ${stat4_label},
                    cta_desc = ${cta_desc}, footer_address = ${footer_address}, footer_copy = ${footer_copy},
                    -- TAMBAHAN BARU
                    section_about_title = ${section_about_title}, section_about_sub = ${section_about_sub},
                    section_feat_title = ${section_feat_title}, section_feat_sub = ${section_feat_sub},
                    section_gallery_title = ${section_gallery_title}, section_gallery_sub = ${section_gallery_sub},
                    section_prod_title = ${section_prod_title}, section_prod_sub = ${section_prod_sub},
                    section_testi_title = ${section_testi_title}, section_testi_sub = ${section_testi_sub},
                    trust1_text = ${trust1_text}, trust2_text = ${trust2_text}, trust3_text = ${trust3_text}, trust4_text = ${trust4_text}, trust5_text = ${trust5_text}
                WHERE id = 1
            `;
            
            return res.status(200).json({ success: true, message: 'Konten berhasil diupdate' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};