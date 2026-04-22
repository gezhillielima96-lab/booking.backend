const db = require('../config/db'); 

exports.getProperties = async (req, res) => {
    try {
        const sql = `
            SELECT p.*, m.file_path as foto 
            FROM properties p 
            LEFT JOIN media m ON p.id = m.model_id AND m.model_type = 'property'
            GROUP BY p.id
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("Error te getProperties:", error);
        res.status(500).json({ message: "Gabim gjatë marrjes së pronave" });
    }
};


exports.addProperty = async (req, res) => {
    try {
        const { emri_prones, pershkrimi, lokacioni, kategoria, cmimi } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        if (!emri_prones || !lokacioni) {
            return res.status(400).json({ message: "Emri dhe Lokacioni janë të detyrueshme!" });
        }

        const [result] = await db.query(
            'INSERT INTO properties (emri_prones, pershkrimi, lokacioni, kategoria, cmimi) VALUES ($1, $2, $3, $4, $5)',
            [emri_prones, pershkrimi || '', lokacioni, kategoria || 1, cmimi || 0]
        );

        const propertyId = result.insertId;

        if (imagePath) {
            await db.query(
                'INSERT INTO media (model_type, model_id, file_path) VALUES ($1, $2, $3)',
                ['property', propertyId, imagePath]
            );
        }

        res.status(201).json({ message: "Prona u shtua me sukses!" });
    } catch (error) {
        console.error("Error te addProperty:", error);
        res.status(500).json({ message: "Gabim i serverit" });
    }
};


exports.getPropertyDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const [property] = await db.query('SELECT * FROM properties WHERE id = $1', [id]);
        const [rooms] = await db.query(`
            SELECT r.*, GROUP_CONCAT(m.file_path) as fotot 
            FROM rooms r 
            LEFT JOIN media m ON r.id = m.model_id AND m.model_type = 'room'
            WHERE r.property_id = $1
            GROUP BY r.id 
        `, [id]);

        res.json({ property: property[0], rooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gabim i serverit" });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { emri_prones, lokacioni, pershkrimi, kategoria, cmimi } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const sqlUpdate = `UPDATE properties SET emri_prones = $1, lokacioni = $2, pershkrimi = $3, kategoria = $4, cmimi = $5 WHERE id = $6`;
        await db.query(sqlUpdate, [
            emri_prones || '', 
            lokacioni || '', 
            pershkrimi || '', 
            kategoria || 1, 
            cmimi || 0, 
            id
        ]);
        if (imagePath) {
            const [existing] = await db.query(
                'SELECT id FROM media WHERE model_type = $1 AND model_id = $2', 
                ['property', id]
            );

            if (existing.length > 0) {
                await db.query(
                    'UPDATE media SET file_path = $1 WHERE model_type = $2 AND model_id = $3', 
                    [imagePath, 'property', id]
                );
            } else {
                await db.query(
                    'INSERT INTO media (model_type, model_id, file_path) VALUES ($1, $2, $3)', 
                    ['property', id, imagePath]
                );
            }
        }
        
        res.json({ message: "Prona u përditësua me sukses!" });
    } catch (error) {
        console.error("GABIMI TE UPDATE:", error);
        res.status(500).json({ message: "Gabim gjatë modifikimit" });
    }
};
exports.deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM media WHERE model_type = $1 AND model_id = $2', ['property', id]);
        
        const [rooms] = await db.query('SELECT id FROM rooms WHERE property_id = $1', [id]);
        for (let room of rooms) {
            await db.query('DELETE FROM media WHERE model_type = $1 AND model_id = $2', ['room', room.id]);
        }
        await db.query('DELETE FROM rooms WHERE property_id = $1', [id]);

        await db.query('DELETE FROM properties WHERE id = $1', [id]);

        res.json({ message: "Prona dhe të gjitha të dhënat e saj u fshinë!" });
    } catch (error) {
        console.error("Error te deleteProperty:", error);
        res.status(500).json({ message: "Gabim gjatë fshirjes" });
    }
};