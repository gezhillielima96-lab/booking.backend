const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const db = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { emri, mbiemri, email, password, adminCode } = req.body;
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Ky email është i regjistruar!" });
        }

        const roleValue = (adminCode === 'ADMIN123') ? 'admin' : 'user';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.create({
            emri,
            mbiemri,
            email,
            password: hashedPassword,
            role: roleValue
        });

        const newUserID = result.insertId;

      
        const mesazhiRegjistrimit = `${emri} ${mbiemri}: u regjistrua si përdorues i ri në sistem.`;

        await db.query(
            `INSERT INTO notifications (user_id, mesazhi) VALUES ($1, $2)`,
            [newUserID, mesazhiRegjistrimit]
        );

        res.status(201).json({ message: "U regjistruat me sukses!" });
    } catch (error) {
        console.error("GABIM REGJISTRIMI:", error);
        res.status(500).json({ message: "Gabim gjatë regjistrimit" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(400).json({ message: "Email ose fjalëkalim i gabuar!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email ose fjalëkalim i gabuar!" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.roli }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

       
        const mesazhiLogimit = `${user.emri} ${user.mbiemri}: sapo u kyç në platformë.`;

        await db.query(
            `INSERT INTO notifications (user_id, mesazhi) VALUES ($1, $2)`,
            [user.id, mesazhiLogimit]
        );

        res.json({
            token,
            user: { 
                id: user.id, 
                emri: user.emri, 
                mbiemri: user.mbiemri,
                email: user.email, 
                role: user.roli,
                nr_tel: user.nr_tel,
                data_lindjes: user.data_lindjes 
            }
        });
    } catch (error) {
        console.error("GABIM LOGIN:", error);
        res.status(500).json({ message: "Gabim i serverit" });
    }
};
exports.getProfile = async (req, res) => {
    try {
        const userId = req.query.id || req.body.id; 
        if (!userId) {
            return res.status(400).json({ message: "ID mungon!" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Përdoruesi nuk u gjet" });
        }
        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: "Gabim gjatë ngarkimit" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { id, emri, mbiemri, data_lindjes, nr_tel } = req.body;
        if (!id) return res.status(400).json({ message: "ID mungon!" });
        await User.updateById(id, { emri, mbiemri, data_lindjes, nr_tel });
        res.json({ message: "Profili u përditësua me sukses!" });
    } catch (error) {
        res.status(500).json({ message: "Gabim gjatë përditësimit" });
    }
};