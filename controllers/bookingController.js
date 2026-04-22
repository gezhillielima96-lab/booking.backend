
const db = require('../config/db');
const BookingModel = require('../models/bookingModel');

exports.processBooking = async (req, res) => {
    
    const user_id = req.body.user_id || null;
    const property_id = req.body.property_id || null;
    const room_id = req.body.room_id || null;
    const data_hyrjes = req.body.data_hyrjes || null;
    const data_daljes = req.body.data_daljes || null;
    const totali_pageses = req.body.totali_pageses || 0;

    try {
        
        if (!room_id || !data_hyrjes || !data_daljes) {
            return res.status(400).json({ success: false, message: "Mungojnë të dhënat e rezervimit!" });
        }

        
        const [overlaps] = await db.query(
            `SELECT id FROM bookings 
             WHERE room_id = $1 
             AND statusi != 'anulluar'
             AND (
                (data_hyrjes < $2 AND data_daljes > $3)
             )`,
            [room_id, data_daljes, data_hyrjes]
        );

        if (overlaps.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Kjo dhomë është e rezervuar për këto data." 
            });
        }

   
        const [result] = await db.query(
            `INSERT INTO bookings (user_id, property_id, room_id, data_hyrjes, data_daljes, totali_pageses, statusi) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [user_id, property_id, room_id, data_hyrjes, data_daljes, totali_pageses, 'në pritje']
        );

       
        const [userRows] = await db.query('SELECT emri, mbiemri FROM users WHERE id = $1', [user_id]);
        const [roomRows] = await db.query('SELECT tipi FROM rooms WHERE id = $1', [room_id]);

        const emriKlientit = userRows.length > 0 ? `${userRows[0].emri} ${userRows[0].mbiemri}` : "Klient i Ri";
        const emriDhomes = roomRows.length > 0 ? roomRows[0].tipi : "Dhomë";

        const d1 = new Date(data_hyrjes);
        const d2 = new Date(data_daljes);
        const periudha = `${d1.getDate()}/${d1.getMonth() + 1} - ${d2.getDate()}/${d2.getMonth() + 1}`;

        const mesazhiFinal = `${emriKlientit}: rezervoi "${emriDhomes}" me vlerë €${totali_pageses} (${periudha}).`;

        await db.query(
            `INSERT INTO notifications (user_id, mesazhi) VALUES ($1, $2)`,
            [user_id, mesazhiFinal]
        );

        res.status(201).json({ success: true, message: "Rezervimi u krye!" });

    } catch (err) {
        console.error("GABIM:", err.message);
        res.status(500).json({ success: false, message: "Gabim: " + err.message });
    }
};
exports.getAdminData = async (req, res) => {
    try {
        const data = await BookingModel.getAdminDashboard();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.params.userId;
        const results = await BookingModel.getUserHistory(userId);
        res.json(results);
    } catch (err) {
        console.error("Gabim te getUserBookings:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteBooking = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;
        
     
        const [bookingInfo] = await conn.execute(
            `SELECT b.user_id, r.tipi, u.emri, u.mbiemri 
             FROM bookings b 
             JOIN rooms r ON b.room_id = r.id 
             JOIN users u ON b.user_id = u.id
             WHERE b.id = $1`, [id]
        );

        if (bookingInfo.length === 0) return res.status(404).json({ success: false });

        const userId = bookingInfo[0].user_id;
        const emriDhomes = bookingInfo[0].tipi;
        const emriAutori = `${bookingInfo[0].emri} ${bookingInfo[0].mbiemri}`;

        await conn.beginTransaction();
        await conn.execute('DELETE FROM payments WHERE booking_id = $1', [id]);
        await conn.execute('DELETE FROM bookings WHERE id = $1', [id]);

        
        const mesazhiAnullimi = `${emriAutori}: rezervimi për "${emriDhomes}" u anulua.`;
        await conn.execute(
            'INSERT INTO notifications (user_id, mesazhi) VALUES ($1, $2)',
            [userId, mesazhiAnullimi]
        );

        await conn.commit();
        res.json({ success: true });
    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

exports.getRoomBookings = async (req, res) => {
    try {
        const { roomId } = req.params;
        const [rows] = await db.query('SELECT data_hyrjes, data_daljes FROM bookings WHERE room_id = $1 AND statusi != $2', [roomId, 'anulluar']);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};