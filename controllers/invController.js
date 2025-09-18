//controllers/invControllers.js
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

    // If your file is at /views/classification.ejs:
    res.render("classification", {
      title: `${className} vehicles`,
      grid,                // nav not needed if you set res.locals.nav in middleware
      // nav: await utilities.getNav(), // only if you didn’t add the middleware
    });
  } catch (err) {
    next(err);
  }
};


module.exports = invCont