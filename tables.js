let mysql = require('mysql2');

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Booking" 
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Booking Database!");

  // 1. Tabela Users
  let sqlUsers = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    mbiemri VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    roli ENUM('user', 'admin') DEFAULT 'user',
    nr_tel VARCHAR(20) NULL,          
    data_lindjes DATE NULL,
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  con.query(sqlUsers, function (err, result) {
    if (err) throw err;
    console.log("Table 'users' created");
  });

  // 2. Tabela Properties
  let sqlProperties = `CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emri_prones VARCHAR(255) NOT NULL,
    pershkrimi TEXT,
    lokacioni VARCHAR(255) NOT NULL,
    kategoria INT DEFAULT 1,
    cmimi DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  con.query(sqlProperties, function (err, result) {
    if (err) throw err;
    console.log("Table 'properties' created");
  });

// 3. Tabela Media
let sqlMedia = `CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_type ENUM('user', 'property', 'room') NOT NULL,
    model_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

con.query(sqlMedia, function (err, result) {
    if (err) {
        console.error("Gabim gjatë krijimit të tabelës Media:", err);
    } else {
        console.log("Table 'media' created successfully!");
    }
});

  // 4. Tabela Rooms
  let sqlRooms = `CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    tipi VARCHAR(100) NOT NULL,
    cmimi DECIMAL(10, 2) NOT NULL,
    kapaciteti INT NOT NULL,
    statusi ENUM('E Lirë', 'E Zënë') DEFAULT 'E Lirë',
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  )`;
  con.query(sqlRooms, function (err, result) {
    if (err) throw err;
    console.log("Table 'rooms' created");
  });

  // 5. Tabela Bookings
 const createBookingsTable = `
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  property_id INT NOT NULL, -- Kjo eshte kolona qe te mungonte
  room_id INT NOT NULL,
  data_hyrjes DATE NOT NULL,
  data_daljes DATE NOT NULL,
  totali_pageses DECIMAL(10,2),
  statusi VARCHAR(50) DEFAULT 'ne pritje',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
`;
  con.query(createBookingsTable, function (err, result) {
    if (err) throw err;
    console.log("Table 'bookings' created");
  });

  // 6. Tabela Payments
  let sqlPayments = `CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    shuma DECIMAL(10, 2) NOT NULL,
    metoda_pageses ENUM('kartë', 'paypal', 'cash') NOT NULL,
    statusi ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(100) NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`;
  con.query(sqlPayments, function (err, result) {
    if (err) throw err;
    console.log("Table 'payments' created");
  });
// 7. Tabela Reviews 
let sqlReviews = `CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    room_id INT NULL, 
    nota INT CHECK (nota >= 1 AND nota <= 5),
    komenti TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
)`;

con.query(sqlReviews, function (err, result) {
    if (err) {
        console.log("Gabim gjatë krijimit të tabelës 'reviews':", err.message);
    } else {
        console.log("Table 'reviews' created/updated successfully");
    }
});

// 8. Tabela Notifications
let sqlNotifications = `CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    review_id INT NULL, 
    mesazhi TEXT NOT NULL,
    statusi_leximit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
  )`;

con.query(sqlNotifications, function (err, result) {
    if (err) {
        console.log("Gabim gjatë krijimit të tabelës 'notifications':", err.message);
    } else {
        console.log("Table 'notifications' created/updated successfully");
    }
});

});