const db = require('../config/db');

const Room = {
    create: async (roomData) => {
        const { property_id, tipi, cmimi, kapaciteti } = roomData;
        const sql = `INSERT INTO rooms (property_id, tipi, cmimi, kapaciteti) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [property_id, tipi, cmimi, kapaciteti]);
        return result;
    },

    getByPropertyId: async (propertyId) => {
        const sql = `SELECT * FROM rooms WHERE property_id = ?`;
        const [rows] = await db.execute(sql, [propertyId]);
        return rows;
    },

    getById: async (id) => {
        const sql = `
            SELECT r.*, p.emri_prones 
            FROM rooms r 
            JOIN properties p ON r.property_id = p.id 
            WHERE r.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

  
    delete: async (id) => {
        const sql = `DELETE FROM rooms WHERE id = ?`;
        return await db.execute(sql, [id]);
    }
};

module.exports = Room;