// ============================
//  ENV
// ============================

process.env.NODE_ENV = process.env.NODE_ENV || 'develop';

// ============================
//  Mongo DB
// ============================

let urlDB = '';

if (process.env.NODE_ENV === 'develop') {
  urlDB = 'mongodb://localhost/minesweeper';
} else {
  urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;
// ===============================
//  SERVER PORT
// ===============================

process.env.PORT = process.env.PORT || 4000;
