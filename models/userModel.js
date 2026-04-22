const db = require('../config/db');

const User = {
    // 1. Gjetja sipas email (Per Login/Register)
    findByEmail: async (email) => {
        const result = await db.query(
            'SELECT id, emri, mbiemri, email, password, roli, nr_tel, data_lindjes FROM users WHERE email = $1', 
            [email]
        );
        return result.rows[0]; // Postgres i kthen rreshtat te .rows
    },

    // 2. Krijimi i perdoruesit (Per Register)
    create: async (data) => {
        const { emri, mbiemri, email, password, role } = data;
        const sql = `
            INSERT INTO users (emri, mbiemri, email, password, roli) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id`; // RETURNING id eshte e detyrueshme ne Postgres per te marre ID-ne e re
        
        const result = await db.query(sql, [emri, mbiemri, email, password, role]);
        
        // Kthejme nje objekt qe i ngjan MySQL-it qe controller-i yt te mos kete error
        return { insertId: result.rows[0].id };
    },

    // 3. Gjetja sipas ID (Per Profile)
    findById: async (id) => {
        const result = await db.query(
            'SELECT id, emri, mbiemri, email, roli, nr_tel, data_lindjes FROM users WHERE id = $1', 
            [id]
        );
        return result.rows[0];
    },

    // 4. Update i profilit
    updateById: async (id, data) => {
        const { emri, mbiemri, data_lindjes, nr_tel } = data;
        const sql = `
            UPDATE users 
            SET emri = $1, mbiemri = $2, data_lindjes = $3, nr_tel = $4 
            WHERE id = $5`;
        
        return await db.query(sql, [emri, mbiemri, data_lindjes, nr_tel, id]);
    }
};

module.exports = User;