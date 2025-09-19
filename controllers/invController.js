//controllers/invController.js
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classificationId = Number(req.params.classificationId);
    const result = await invModel.getInventoryByClassificationId(classificationId);
    const rows = Array.isArray(result) ? result : result.rows;  // normalize

    const grid = await utilities.buildClassificationGrid(rows);
    const className = rows?.[0]?.classification_name || "Vehicles";

    // If file is at /views/classification.ejs:
    res.render("classification", {
      title: `${className} vehicles`,
      grid,                // nav not needed if set res.locals.nav in middleware
      // nav: await utilities.getNav(), // only if didn’t add the middleware
    });
  } catch (err) {
    next(err);
  }
};


/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const invId = Number(req.params.invId)
    const item = await invModel.getVehicleByInvId(invId)
    if (!item) return next({ status: 404, message: "Vehicle not found." })

    const title = `${item.inv_year} ${item.inv_make} ${item.inv_model}`
    const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
      .format(item.inv_price)
    const miles = item.inv_miles != null ? new Intl.NumberFormat("en-US").format(item.inv_miles) : null

    res.render("inventory/detail", { title, item, price, miles })
  } catch (err) {
    next(err)
  }
}


module.exports = invCont