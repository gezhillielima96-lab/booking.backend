const db = require('../config/db');

exports.addRoom = async (req, res) => {
    try {
        const { property_id, tipi, cmimi, kapaciteti } = req.body;
        const images = req.files; 

       
        const [result] = await db.query(
            'INSERT INTO rooms (property_id, tipi, cmimi, kapaciteti) VALUES ($1, $2, $3, $4)',
            [property_id, tipi, cmimi, kapaciteti || 1]
        );

        const roomId = result.insertId;

       
        if (images && images.length > 0) {
            const mediaQueries = images.map(img => {
                return db.query(
                    'INSERT INTO media (model_type, model_id, file_path) VALUES ($1, $2, $3)',
                    ['room', roomId, `/uploads/${img.filename}`]
                );
            });
            await Promise.all(mediaQueries);
        }

        res.status(201).json({ message: "Dhoma dhe fotot u shtuan me sukses!", roomId });
    } catch (error) {
        console.error("Error te addRoom:", error);
        res.status(500).json({ message: "Gabim gjatë shtimit të dhomës" });
    }
};


exports.getRoomsByProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
       
        const sql = `
            SELECT r.*, GROUP_CONCAT(m.file_path) as fotot 
            FROM rooms r 
            LEFT JOIN media m ON r.id = m.model_id AND m.model_type = 'room'
            WHERE r.property_id = ?
            GROUP BY r.id
        `;
        
        const [rows] = await db.query(sql, [propertyId]);
        res.json(rows);
    } catch (error) {
        console.error("Error te getRoomsByProperty:", error);
        res.status(500).json({ message: "Gabim gjatë marrjes së dhomave" });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { property_id, tipi, cmimi, kapaciteti } = req.body;
        const images = req.files; 

    
        await db.query(
            'UPDATE rooms SET property_id = $1, tipi = $2, cmimi = $3, kapaciteti = $4 WHERE id = $5',
            [property_id, tipi, cmimi, kapaciteti, id]
        );

        if (images && images.length > 0) {
          
            await db.query('DELETE FROM media WHERE model_type = "room" AND model_id = $1', [id]);

            
            const mediaQueries = images.map(img => {
                return db.query(
                    'INSERT INTO media (model_type, model_id, file_path) VALUES ($1, $2, $3)',
                    ['room', id, `/uploads/${img.filename}`]
                );
            });
            await Promise.all(mediaQueries);
        }

        res.json({ message: "Dhoma u përditësua me sukses!" });
    } catch (error) {
        console.error("Error te updateRoom:", error);
        res.status(500).json({ message: "Gabim gjatë modifikimit të dhomës" });
    }
};


exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

       
        await db.query('DELETE FROM media WHERE model_type = "room" AND model_id = $1', [id]);
        
       
        await db.query('DELETE FROM rooms WHERE id = $1', [id]);
        
        res.json({ message: "Dhoma dhe të gjitha fotot e saj u fshinë!" });
    } catch (error) {
        console.error("Error te deleteRoom:", error);
        res.status(500).json({ message: "Gabim gjatë fshirjes" });
    }
};