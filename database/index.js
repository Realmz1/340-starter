const { Pool } = require("pg")
require("dotenv").config()

const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Render SSL
  },
})

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("❌ Database connection error", err))

module.exports = pool
