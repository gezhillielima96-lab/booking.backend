const db = require('../config/db');

const Room = {
    // 1. Krijo nje dhome te re
    create: async (roomData) => {
        const { property_id, tipi, cmimi, kapaciteti } = roomData;
        const sql = `
            INSERT INTO rooms (property_id, tipi, cmimi, kapaciteti) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id`; 
        
        const result = await db.query(sql, [property_id, tipi, cmimi, kapaciteti]);
        
        // Kthejme objektin me insertId per te ruajtur konsistencen me controller-at
        return { insertId: result.rows[0].id };
    },

    // 2. Merr te gjitha dhomat e nje prone
    getByPropertyId: async (propertyId) => {
        const sql = `SELECT * FROM rooms WHERE property_id = $1`;
        const result = await db.query(sql, [propertyId]);
        return result.rows;
    },

    // 3. Merr nje dhome specifike sipas ID (bashke me emrin e prones)
    getById: async (id) => {
        const sql = `
            SELECT r.*, p.emri_prones 
            FROM rooms r 
            JOIN properties p ON r.property_id = p.id 
            WHERE r.id = $1
        `;
        const result = await db.query(sql, [id]);
        return result.rows[0];
    },

    // 4. Fshij nje dhome
    delete: async (id) => {
        const sql = `DELETE FROM rooms WHERE id = $1`;
        return await db.query(sql, [id]);
    }
};

module.exports = Room;