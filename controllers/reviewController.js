const db = require('../config/db'); 


exports.addReview = async (req, res) => {
    try {
        const { user_id, property_id, room_id, nota, komenti, full_name } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO reviews (user_id, property_id, room_id, nota, komenti) VALUES (?, ?, ?, ?, ?)`,
            [user_id, property_id, room_id || null, nota, komenti]
        );

    
        const emriAutori = full_name || "Një klient";
        const mesazhiNjoftimit = `${emriAutori}: sapo la një vlerësim me ${nota} yje.`;
        
        await db.execute(
            `INSERT INTO notifications (user_id, review_id, mesazhi) VALUES (?, ?, ?)`,
            [user_id, result.insertId, mesazhiNjoftimit]
        );

        res.status(201).json({ success: true, message: "Vlerësimi u dërgua!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.getPropertyStats = async (req, res) => {
    try {
        const { propertyId } = req.params;
        
  
        const [stats] = await db.execute(
            `SELECT AVG(nota) as mesatarja, COUNT(*) as totali FROM reviews WHERE property_id = ?`, 
            [propertyId]
        );

       
        const [reviews] = await db.execute(
            `SELECT r.*, u.emri, u.mbiemri FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.property_id = ? ORDER BY r.created_at DESC`, 
            [propertyId]
        );

        res.json({ stats: stats[0], reviews: reviews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReviewsByProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const [rows] = await db.execute('SELECT * FROM reviews WHERE property_id = ?', [propertyId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAdminNotifications = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT n.*, CONCAT(u.emri, ' ', u.mbiemri) AS autori 
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            WHERE n.statusi_leximit = FALSE
            ORDER BY n.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('UPDATE notifications SET statusi_leximit = TRUE WHERE id = ?', [id]);
        res.json({ message: "Njoftimi u lexua" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY krijuar_me DESC', 
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error("Gabim te njoftimet e userit:", err);
        res.status(500).json({ error: err.message });
    }
};