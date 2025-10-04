// models/inventory-model.js
const pool = require("../database/")

/* ***************************
 *  Get all classifications
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
    return data
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Get vehicles by classification ID
 * ************************** */
async function getVehicleByClassificationId(classificationId) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE classification_id = $1"
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
    const sql = "SELECT * FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [invId])
    return data.rows[0]
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Module exports
 * ************************** */
module.exports = {
  getClassifications,
  getVehicleByClassificationId,
  getVehicleById
}
