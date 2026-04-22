const db = require('../config/db');

const Booking = {
    getAdminDashboard: async () => {
        const sql = `
            SELECT 
                b.id, 
                u.emri, u.mbiemri, 
                p.emri_prones, 
                r.tipi AS dhoma, r.kapaciteti,
                b.data_hyrjes, b.data_daljes, b.totali_pageses, b.statusi AS booking_status,
                pay.metoda_pageses, pay.statusi AS payment_status, pay.payment_date
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN rooms r ON b.room_id = r.id
            JOIN properties p ON r.property_id = p.id
            LEFT JOIN payments pay ON b.id = pay.booking_id
            ORDER BY b.created_at DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    getUserHistory: async (userId) => {
        const sql = `
            SELECT 
                b.id, 
                b.data_hyrjes, b.data_daljes, b.totali_pageses, b.statusi,
                p.emri_prones, r.tipi, r.kapaciteti
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN properties p ON r.property_id = p.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }
};

module.exports = Booking;