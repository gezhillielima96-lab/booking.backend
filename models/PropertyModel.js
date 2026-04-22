const db = require('../config/db');

const Property = {
    // 1. Merr te gjitha pronat
    getAll: async () => {
        const result = await db.query('SELECT * FROM properties');
        return result.rows;
    },

    // 2. Merr nje prone specifike sipas ID
    getById: async (id) => {
        const result = await db.query('SELECT * FROM properties WHERE id = $1', [id]);
        return result.rows[0];
    },

    // 3. Merr dhomat e nje prone
    getRoomsByPropertyId: async (id) => {
        const result = await db.query('SELECT * FROM rooms WHERE property_id = $1', [id]);
        return result.rows;
    },

    // 4. Krijo nje prone te re
    create: async (data) => {
        const { emri_prones, pershkrimi, lokacioni, kategoria } = data;
        const sql = `
            INSERT INTO properties (emri_prones, pershkrimi, lokacioni, kategoria) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id`; 
        
        const result = await db.query(sql, [emri_prones, pershkrimi, lokacioni, kategoria]);
        return { insertId: result.rows[0].id };
    },

    // 5. Perditeso median (e kthyer ne async per konsistence)
    updateMedia: async (id, imagePath) => {
        const sql = `
            UPDATE properties 
            SET image = $1 
            WHERE id = $2
        `;
        return await db.query(sql, [imagePath, id]);
    },
};

module.exports = Property;