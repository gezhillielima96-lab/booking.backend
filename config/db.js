const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "process.env.DATABASE_URL",

  ssl: {
    rejectUnauthorized: false
  }
});


pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Gabim lidhjeje me Supabase:', err);
  } else {
    console.log('Lidhja me Supabase u krye me SUCKSES!');
  }
});

module.exports = pool;