// controllers/invController.js
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

// existing exports …

/* ***************************
 *  Deliver vehicle detail view
 * ************************** */
async function buildByInvId(req, res, next) {
  try {
    const invId = parseInt(req.params.invId)
    const vehicleData = await invModel.getVehicleById(invId)

    if (!vehicleData) {
      // if nothing returned, let error middleware handle
      return next(new Error("Vehicle not found"))
    }

    const html = utilities.buildDetailView(vehicleData)
    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav: await utilities.getNav(),
      content: html
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { buildByClassificationId, buildByInvId }
