// routes/accountRoute.js
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// Route to display login view
router.get("/login", accountController.buildLogin)

// Route to display registration view
router.get("/register", accountController.buildRegister)

// Process the registration data
router.post(
    "/register",
    utilities.registrationRules(),
    utilities.checkRegData,
    accountController.registerAccount
)

// Process the login attempt
router.post(
    "/login",
    utilities.loginRules(),
    utilities.checkLoginData,
    accountController.accountLogin
)

// Route to display account management view (requires login)
router.get("/", utilities.checkJWTToken, accountController.buildAccountManagement)

// Route to display account update view (requires login)
router.get("/update/:account_id", utilities.checkJWTToken, accountController.buildAccountUpdate)

// Process account information update
router.post(
    "/update",
    utilities.checkJWTToken,
    utilities.accountUpdateRules(),
    utilities.checkAccountUpdateData,
    accountController.updateAccount
)

// Process password update
router.post(
    "/update-password",
    utilities.checkJWTToken,
    utilities.passwordUpdateRules(),
    utilities.checkPasswordUpdateData,
    accountController.updatePassword
)

// Logout route
router.get("/logout", accountController.logout)

module.exports = router

