// models/review-model.js
const pool = require("../database")

/* ***************************
 * Add a new review
 * ************************** */
async function addReview(review_text, review_rating, inventory_id, account_id) {
    try {
        const sql = `INSERT INTO review (review_text, review_rating, inventory_id, account_id) 
                 VALUES ($1, $2, $3, $4) RETURNING *`
        const result = await pool.query(sql, [review_text, review_rating, inventory_id, account_id])
        return result.rows[0]
    } catch (error) {
        console.error("Add review error: " + error)
        return null
    }
}

/* ***************************
 * Get all reviews for a vehicle
 * ************************** */
async function getReviewsByInventoryId(inventory_id) {
    try {
        const sql = `SELECT r.review_id, r.review_text, r.review_rating, r.review_date,
                        a.account_firstname, a.account_lastname
                 FROM review r
                 JOIN account a ON r.account_id = a.account_id
                 WHERE r.inventory_id = $1
                 ORDER BY r.review_date DESC`
        const result = await pool.query(sql, [inventory_id])
        return result.rows
    } catch (error) {
        console.error("Get reviews by inventory error: " + error)
        return []
    }
}

/* ***************************
 * Get all reviews by a user
 * ************************** */
async function getReviewsByAccountId(account_id) {
    try {
        const sql = `SELECT r.review_id, r.review_text, r.review_rating, r.review_date,
                        i.inv_make, i.inv_model, i.inv_year, i.inventory_id
                 FROM review r
                 JOIN inventory i ON r.inventory_id = i.inventory_id
                 WHERE r.account_id = $1
                 ORDER BY r.review_date DESC`
        const result = await pool.query(sql, [account_id])
        return result.rows
    } catch (error) {
        console.error("Get reviews by account error: " + error)
        return []
    }
}

/* ***************************
 * Update a review
 * ************************** */
async function updateReview(review_id, review_text, review_rating) {
    try {
        const sql = `UPDATE review 
                 SET review_text = $1, review_rating = $2 
                 WHERE review_id = $3 
                 RETURNING *`
        const result = await pool.query(sql, [review_text, review_rating, review_id])
        return result.rows[0]
    } catch (error) {
        console.error("Update review error: " + error)
        return null
    }
}

/* ***************************
 * Delete a review
 * ************************** */
async function deleteReview(review_id, account_id) {
    try {
        const sql = `DELETE FROM review 
                 WHERE review_id = $1 AND account_id = $2 
                 RETURNING *`
        const result = await pool.query(sql, [review_id, account_id])
        return result.rows[0]
    } catch (error) {
        console.error("Delete review error: " + error)
        return null
    }
}

/* ***************************
 * Get a single review by ID
 * ************************** */
async function getReviewById(review_id) {
    try {
        const sql = `SELECT * FROM review WHERE review_id = $1`
        const result = await pool.query(sql, [review_id])
        return result.rows[0]
    } catch (error) {
        console.error("Get review by ID error: " + error)
        return null
    }
}

module.exports = {
    addReview,
    getReviewsByInventoryId,
    getReviewsByAccountId,
    updateReview,
    deleteReview,
    getReviewById
}

