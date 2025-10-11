// utilities/index.js
const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ***************************
 *  Build the navigation bar
 * ************************** */
async function getNav() {
  try {
    const data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.forEach((row) => {
      list += `
        <li>
          <a href="/inv/type/${row.classification_id}" 
             title="See our ${row.classification_name} inventory">
            ${row.classification_name}
          </a>
        </li>`
    })
    list += "</ul>"
    return list
  } catch (error) {
    console.error("Error building nav:", error)
    return "<ul><li><a href='/'>Home</a></li></ul>"
  }
}

/* ***************************
 *  Validation Rules
 * ************************** */
function classificationRules() {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage(
        "Classification name must contain only letters or numbers (no spaces or special characters)."
      ),
  ]
}

function inventoryRules() {
  return [
    body("classification_id").isInt({ min: 1 }).withMessage("Please select a classification."),
    body("inv_make").trim().isLength({ min: 1 }).withMessage("Make is required."),
    body("inv_model").trim().isLength({ min: 1 }).withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Enter a valid year between 1900 and 2100."),
    body("inv_description").trim().isLength({ min: 1 }).withMessage("Description is required."),
    body("inv_image").trim().isLength({ min: 1 }).withMessage("Image path is required."),
    body("inv_thumbnail").trim().isLength({ min: 1 }).withMessage("Thumbnail path is required."),
    body("inv_price").isFloat({ min: 0.01 }).withMessage("Price must be a positive number."),
  ]
}

/* ***************************
 *  Error Handling Middleware
 * ************************** */
async function checkClassificationData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await getNav()
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      notice: req.flash("notice"),
    })
  }
  next()
}

async function checkInventoryData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await getNav()
    let classificationList = await buildClassificationList(req.body.classification_id)
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body,
    })
  }
  next()
}

/* ***************************
 * Build Classification Drop-Down List
 * ************************** */
async function buildClassificationList(classification_id = null) {
  const data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  // data is already an array from the model
  data.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ***************************
 * Build vehicle detail HTML
 * ************************** */
function buildDetailView(vehicle) {
  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
        <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
        <p class="price"><strong>Price: $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</strong></p>
        <p><strong>Year:</strong> ${vehicle.inv_year}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </div>
  `
}

/* ***************************
 * Account Validation Rules
 * ************************** */
function registrationRules() {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

function loginRules() {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Password is required."),
  ]
}

function accountUpdateRules() {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const accountData = await accountModel.getAccountById(account_id)
        // Only check if email exists if it's being changed
        if (account_email !== accountData.account_email) {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists) {
            throw new Error("Email exists. Please use a different email")
          }
        }
      }),
  ]
}

function passwordUpdateRules() {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ***************************
 * Check Account Data
 * ************************** */
async function checkRegData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await getNav()
    return res.render("account/register", {
      title: "Registration",
      nav,
      errors: errors.array(),
      notice: req.flash("notice"),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

async function checkLoginData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await getNav()
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      notice: req.flash("notice"),
      account_email: req.body.account_email,
    })
  }
  next()
}

async function checkAccountUpdateData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await getNav()
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: errors.array(),
      notice: req.flash("notice"),
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

async function checkPasswordUpdateData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await getNav()
    const accountData = await accountModel.getAccountById(req.body.account_id)
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: errors.array(),
      notice: req.flash("notice"),
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
  }
  next()
}

/* ***************************
 * Middleware to check token validity
 * ************************** */
function checkJWTToken(req, res, next) {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    req.flash("notice", "Please log in")
    return res.redirect("/account/login")
  }
}

/* ***************************
 * Check Login and make account data available
 * ************************** */
function checkLogin(req, res, next) {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ***************************
 * Middleware to check account type
 * ************************** */
function checkAccountType(req, res, next) {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err || (accountData.account_type !== "Employee" && accountData.account_type !== "Admin")) {
          req.flash("notice", "You do not have permission to access this resource.")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    req.flash("notice", "Please log in")
    return res.redirect("/account/login")
  }
}

/* ***************************
 * Review Validation Rules - For Adding Reviews
 * ************************** */
function reviewRules() {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review must be between 10 and 1000 characters."),
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),
    body("inventory_id")
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle ID."),
  ]
}

/* ***************************
 * Review Update Validation Rules
 * ************************** */
function reviewUpdateRules() {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review must be between 10 and 1000 characters."),
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),
    body("review_id")
      .isInt({ min: 1 })
      .withMessage("Invalid review ID."),
  ]
}

/* ***************************
 * Check Review Data - For Adding Reviews
 * ************************** */
async function checkReviewData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", "Please fix the errors in your review.")
    return res.redirect(`/inv/detail/${req.body.inventory_id}`)
  }
  next()
}

/* ***************************
 * Check Review Update Data
 * ************************** */
async function checkReviewUpdateData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", "Please fix the errors in your review.")
    return res.redirect(`/review/edit/${req.body.review_id}`)
  }
  next()
}

/* ***************************
 *  Exports
 * ************************** */
module.exports = {
  getNav,
  classificationRules,
  inventoryRules,
  checkClassificationData,
  checkInventoryData,
  buildClassificationList,
  buildDetailView,
  registrationRules,
  loginRules,
  accountUpdateRules,
  passwordUpdateRules,
  checkRegData,
  checkLoginData,
  checkAccountUpdateData,
  checkPasswordUpdateData,
  checkJWTToken,
  checkLogin,
  checkAccountType,
  reviewRules,
  reviewUpdateRules,
  checkReviewData,
  checkReviewUpdateData
};
