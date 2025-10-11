// controllers/invController.js
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
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

    // Get reviews for this vehicle
    const reviews = await reviewModel.getReviewsByInventoryId(invId)

    const detailHTML = utilities.buildDetailView(vehicle)
    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav: await utilities.getNav(),
      content: detailHTML,
      reviews,
      inventory_id: invId,
      notice: req.flash("notice")
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
    const detailHref = `/inv/detail/${vehicle.inventory_id}`
    grid += `
      <li>
        <a href="${detailHref}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        </a>
        <div class="namePrice">
          <h2>
            <a href="${detailHref}">${vehicle.inv_make} ${vehicle.inv_model}</a>
          </h2>
<span>$${new Intl.NumberFormat("en-US").format(Number(vehicle.inv_price))}</span>
        </div>
      </li>`
  })
  grid += "</ul>"
  return grid
}

async function buildManagementView(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    notice: req.flash("notice"),
  })
}

/* ***************************
 * Build Add Classification View
 *************************** */
async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    notice: req.flash("notice"),
  })
}

/* ***************************
 * Add Classification to Database
 *************************** */
async function addClassification(req, res, next) {
  try {
    const { classification_name } = req.body
    const result = await invModel.addClassification(classification_name)

    if (result) {
      req.flash("notice", "New classification added successfully!")
      let nav = await utilities.getNav()
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        notice: req.flash("notice"),
      })
    } else {
      req.flash("notice", "Failed to add classification.")
      res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        nav: await utilities.getNav(),
        notice: req.flash("notice"),
      })
    }
  } catch (error) {
    next(error)
  }
}

// Show the add-inventory view
async function buildAddInventory(req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      messages: req.flash("notice"),
    })
  } catch (error) {
    next(error)
  }
}

// Handle POST
async function addInventory(req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price
    } = req.body

    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price
    })

    if (result) {
      req.flash("notice", "Vehicle successfully added.")
      res.redirect("/inv")
    } else {
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(classification_id)
      req.flash("notice", "Failed to add vehicle. Please try again.")
      res.render("inventory/add-inventory", {
        title: "Add Vehicle",
        nav,
        classificationList,
        messages: req.flash("notice"),
        ...req.body  // stickiness
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Exports
 * ************************** */
module.exports = { buildByClassificationId, buildByInvId, buildManagementView, buildAddClassification, addClassification, buildAddInventory, addInventory }
