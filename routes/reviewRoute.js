// routes/reviewRoute.js
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const reviewController = require("../controllers/reviewController")

// All review routes require login
router.use(utilities.checkJWTToken)

// Add a new review
router.post(
    "/add",
    utilities.reviewRules(),
    utilities.checkReviewData,
    reviewController.addReview
)

// View user's reviews
router.get("/my-reviews", reviewController.showUserReviews)

// Show edit form
router.get("/edit/:review_id", reviewController.showEditReview)

// Update review
router.post(
    "/update",
    utilities.reviewUpdateRules(),
    utilities.checkReviewUpdateData,
    reviewController.updateReview
)

// Delete review
router.get("/delete/:review_id", reviewController.deleteReview)

module.exports = router

