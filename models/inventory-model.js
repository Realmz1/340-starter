// models/inventory-model.js
const pool = require("../database/")

/* ***************************
 *  Get all classifications
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
    return data.rows
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Get vehicles by classification ID (with classification name)
 * ************************** */
async function getVehicleByClassificationId(classificationId) {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM public.inventory i
      JOIN public.classification c
        ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1
      ORDER BY i.inv_make, i.inv_model
    `
    const data = await pool.query(sql, [classificationId])
    return data.rows
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Get a single vehicle by inventory ID
 * ************************** */
async function getVehicleById(invId) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE inventory_id = $1"
    const data = await pool.query(sql, [invId])
    return data.rows[0]
  } catch (error) {
    throw error
  }
}

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rowCount
  } catch (error) {
    console.error("Database insertion failed:", error)
    return null
  }
}

async function addInventory(vehicle) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        classification_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `
    const values = [
      vehicle.classification_id,
      vehicle.inv_make,
      vehicle.inv_model,
      vehicle.inv_year,
      vehicle.inv_description,
      vehicle.inv_image,
      vehicle.inv_thumbnail,
      vehicle.inv_price,
      vehicle.inv_miles,
      vehicle.inv_color
    ]
    const data = await pool.query(sql, values)
    return data.rows[0]
  } catch (error) {
    console.error("Error inserting vehicle:", error)
    return null
  }
}


/* ***************************
 *  Module exports
 * ************************** */
module.exports = {
  getClassifications,
  getVehicleByClassificationId,
  getVehicleById,
  addClassification,
  addInventory
}
