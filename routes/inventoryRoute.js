// routes/inventoryRoute.js
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const invController = require("../controllers/invController")

// Public routes - no authentication required
// existing classification route
router.get("/type/:classificationId", invController.buildByClassificationId)

// NEW: detail route
router.get("/detail/:invId", invController.buildByInvId)

// Protected routes - require Employee or Admin access
router.get("/", utilities.checkAccountType, invController.buildManagementView)

// Show Add Classification form
router.get("/add-classification", utilities.checkAccountType, invController.buildAddClassification)

// Handle Add Classification submission
router.post(
  "/add-classification",
  utilities.checkAccountType,
  utilities.classificationRules(),
  utilities.checkClassificationData,
  invController.addClassification
)

// Show Add Inventory form
router.get("/add-inventory", utilities.checkAccountType, invController.buildAddInventory)

// Handle Add Inventory submission
router.post(
  "/add-inventory",
  utilities.checkAccountType,
  utilities.inventoryRules(),
  utilities.checkInventoryData,
  invController.addInventory
)

module.exports = router
