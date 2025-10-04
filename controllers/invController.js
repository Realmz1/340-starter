// controllers/invController.js
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

/* ***************************
 *  Build inventory by classification view
 * ************************** */
async function buildByClassificationId(req, res, next) {
  try {
    const classificationId = parseInt(req.params.classificationId)
    const data = await invModel.getVehicleByClassificationId(classificationId)
    const className = data.length > 0 ? data[0].classification_name : "Vehicles"
    const grid = await buildClassificationGrid(data)

    res.render("inventory/classification", {
      title: `${className} Vehicles`,
      nav: await utilities.getNav(),
      grid
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
async function buildByInvId(req, res, next) {
  try {
    const invId = parseInt(req.params.invId)
    const vehicle = await invModel.getVehicleById(invId)

    if (!vehicle) {
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, that vehicle could not be found.",
        nav: await utilities.getNav()
      })
    }

    const detailHTML = utilities.buildDetailView(vehicle)
    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav: await utilities.getNav(),
      content: detailHTML
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build HTML grid for classification listings
 * ************************** */
async function buildClassificationGrid(data) {
  if (!data || data.length === 0) {
    return "<p class='notice'>No vehicles found for this classification.</p>"
  }

  let grid = '<ul id="inv-display">'
  data.forEach((vehicle) => {
    grid += `
      <li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        </a>
        <div class="namePrice">
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}">${vehicle.inv_make} ${vehicle.inv_model}</a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>`
  })
  grid += "</ul>"
  return grid
}

/* ***************************
 *  Exports
 * ************************** */
module.exports = { buildByClassificationId, buildByInvId }
