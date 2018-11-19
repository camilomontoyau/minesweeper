// ============================
//  ENV
// ============================

process.env.NODE_ENV = process.env.NODE_ENV || 'develop';

// ============================
//  Mongo DB
// ============================

let urlDB = '';

if (process.env.NODE_ENV === 'develop') {
  urlDB =
    'mongodb://minesweeper-user:m1n35w33p3r-p455w0rD@ds211724.mlab.com:11724/minesweeper';
} else {
  urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;
// ===============================
//  SERVER PORT
// ===============================

process.env.PORT = process.env.PORT || 4000;
