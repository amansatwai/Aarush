const { Pool } = require("pg");

const pool = new Pool({
  host: "db.fglmfzbtxwazjsqyvdvf.supabase.co",
  port: 5432,
  user: "postgres",
  password: "Aarush2026#",
  database: "postgres",
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL database");
    console.log(result.rows[0]);
  } catch (err) {
    console.error("PostgreSQL connection error:");
    console.error(err);
  }
})();

module.exports = pool;