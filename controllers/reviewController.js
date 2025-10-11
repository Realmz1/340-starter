// controllers/reviewController.js
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

/* ****************************************
*  Add a new review
* *************************************** */
async function addReview(req, res) {
    let nav = await utilities.getNav()
    const { review_text, review_rating, inventory_id } = req.body
    const account_id = res.locals.accountData.account_id

    const result = await reviewModel.addReview(review_text, review_rating, inventory_id, account_id)

    if (result) {
        req.flash("notice", "Thank you! Your review has been added.")
        res.redirect(`/inv/detail/${inventory_id}`)
    } else {
        req.flash("notice", "Sorry, adding the review failed.")
        res.redirect(`/inv/detail/${inventory_id}`)
    }
}

/* ****************************************
*  Display user's reviews
* *************************************** */
async function showUserReviews(req, res) {
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData.account_id
    const reviews = await reviewModel.getReviewsByAccountId(account_id)

    res.render("review/my-reviews", {
        title: "My Reviews",
        nav,
        reviews,
        errors: null,
        notice: req.flash("notice"),
    })
}

/* ****************************************
*  Show edit review form
* *************************************** */
async function showEditReview(req, res) {
    let nav = await utilities.getNav()
    const review_id = parseInt(req.params.review_id)
    const review = await reviewModel.getReviewById(review_id)

    if (!review || review.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Review not found or you don't have permission to edit it.")
        return res.redirect("/review/my-reviews")
    }

    res.render("review/edit-review", {
        title: "Edit Review",
        nav,
        review_id: review.review_id,
        review_text: review.review_text,
        review_rating: review.review_rating,
        errors: null,
        notice: req.flash("notice"),
    })
}

/* ****************************************
*  Process review update
* *************************************** */
async function updateReview(req, res) {
    let nav = await utilities.getNav()
    const { review_id, review_text, review_rating } = req.body
    const account_id = res.locals.accountData.account_id

    // Verify ownership
    const existingReview = await reviewModel.getReviewById(review_id)
    if (!existingReview || existingReview.account_id !== account_id) {
        req.flash("notice", "You don't have permission to edit this review.")
        return res.redirect("/review/my-reviews")
    }

    const result = await reviewModel.updateReview(review_id, review_text, review_rating)

    if (result) {
        req.flash("notice", "Review updated successfully.")
        res.redirect("/review/my-reviews")
    } else {
        req.flash("notice", "Sorry, updating the review failed.")
        res.render("review/edit-review", {
            title: "Edit Review",
            nav,
            review_id,
            review_text,
            review_rating,
            errors: null,
            notice: req.flash("notice"),
        })
    }
}

/* ****************************************
*  Delete a review
* *************************************** */
async function deleteReview(req, res) {
    const review_id = parseInt(req.params.review_id)
    const account_id = res.locals.accountData.account_id

    const result = await reviewModel.deleteReview(review_id, account_id)

    if (result) {
        req.flash("notice", "Review deleted successfully.")
    } else {
        req.flash("notice", "Sorry, deleting the review failed.")
    }

    res.redirect("/review/my-reviews")
}

module.exports = {
    addReview,
    showUserReviews,
    showEditReview,
    updateReview,
    deleteReview
}

