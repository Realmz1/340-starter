const invModel = require("../models/inventory-model")

/* ***************************
 *  Build the navigation bar
 * ************************** */
const invModel = require("../models/inventory-model")

async function getNav() {
  try {
    const data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
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

module.exports = { getNav, buildDetailView }

/* ***************************
 *  Build the vehicle detail view
 * ************************** */
function buildDetailView(vehicle) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price)

  const miles = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  return `
    <section class="vehicle-detail">
      <img src="${vehicle.inv_image}" 
           alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </section>
  `
}

module.exports = { getNav, buildDetailView }
