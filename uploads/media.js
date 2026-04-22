const multer = require("multer");
const path = require("path");
const db = require("../config/db");

/* Storage config */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

/* Multer instance */
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files allowed"), false);
        }
        cb(null, true);
    }
});

/* Save image path in DB */
const register = (imagePath, propertyId, callback) => {
    const sql = `INSERT INTO media (image_path, property_id) VALUES (?, ?)`;
    db.query(sql, [imagePath, propertyId], callback);
};

/* Get media by id */
const getById = (id, callback) => {
    const sql = `SELECT * FROM media WHERE id = ?`;
    db.query(sql, [id], callback);
};

module.exports = {
    upload,
    register,
    getById
};