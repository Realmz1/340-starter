// routes/inventoryRoute.js
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// existing classification route
router.get("/type/:classificationId", invController.buildByClassificationId)

// NEW: detail route
router.get("/detail/:invId", invController.buildByInvId)

module.exports = router
