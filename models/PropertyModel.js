const db = require('../config/db');

const Property = {
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM properties');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);
        return rows[0];
    },
    getRoomsByPropertyId: async (id) => {
        const [rows] = await db.execute('SELECT * FROM rooms WHERE property_id = ?', [id]);
        return rows;
    },
    create: async (data) => {
        const { emri_prones, pershkrimi, lokacioni, kategoria } = data;
        const sql = `INSERT INTO properties (emri_prones, pershkrimi, lokacioni, kategoria) VALUES (?, ?, ?, ?)`;
        return await db.execute(sql, [emri_prones, pershkrimi, lokacioni, kategoria]);
    },
    updateMedia:  (id, imagePath, callback)=>{
        const sql = `
        UPDATE properties 
        SET image = ? 
        WHERE id = ?
        `;
        db.query(sql, [imagePath, id], callback);
    },
};

module.exports = Property;