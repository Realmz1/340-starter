const { Pool } = require("pg")
require("dotenv").config()

// create a new connection pool using values from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
})

// confirm connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Database connection error", err.stack))

module.exports = pool
