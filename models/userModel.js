const db = require('../config/db');

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT id, emri, mbiemri, email, password, roli, nr_tel, data_lindjes FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    create: async (data) => {
        const { emri, mbiemri, email, password, role } = data;
        const sql = `INSERT INTO users (emri, mbiemri, email, password, roli) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [emri, mbiemri, email, password, role]);
        return result;
    },
    findById: async (id) => {
        const [rows] = await db.execute('SELECT id, emri, mbiemri, email, roli, nr_tel, data_lindjes FROM users WHERE id = ?', [id]);
        return rows[0];
    },
    updateById: async (id, data) => {
        const { emri, mbiemri, data_lindjes, nr_tel } = data;
        const sql = `UPDATE users SET emri = ?, mbiemri = ?, data_lindjes = ?, nr_tel = ? WHERE id = ?`;
        return await db.execute(sql, [emri, mbiemri, data_lindjes, nr_tel, id]);
    }
};

module.exports = User;