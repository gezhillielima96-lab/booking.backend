const express = require('express');
const cors = require('cors');
require('dotenv').config();


const db = require('./config/db'); 

const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/uploads", express.static("uploads"));

const apiRoutes = require('./routes/api');


app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Serveri po punon në portin ${PORT}`);
    console.log(` Testo këtu: http://localhost:${PORT}/api/all`);
});


