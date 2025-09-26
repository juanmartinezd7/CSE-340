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


/* Task 1: management view (GET /inv) */
invCont.buildManagement = async function (req, res) {
  res.render("inventory/management", { title: "Vehicle Management" })
}

/* Task 2: show add-classification form */
invCont.buildAddClassification = async function (req, res) {
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    classification_name: ""
  })
}

/* Task 2: handle add-classification POST */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const row = await invModel.addClassification(classification_name)
    if (row?.classification_id) {
      req.flash("notice", `“${classification_name}” added.`)
      // rebuild nav immediately for this response
      const nav = await utilities.getNav()
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav
      })
    }
    req.flash("notice", "Insert failed.")
    res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      classification_name
    })
  } catch (err) { next(err) }
}

/* Task 3: show add-inventory form */
invCont.buildAddInventory = async function (req, res) {
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    classificationList,
    inv_make: "", inv_model: "", inv_year: "",
    inv_description: "", inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image.png",
    inv_price: "", inv_miles: "", inv_color: ""
  })
}

/* Task 3: handle add-inventory POST */
invCont.addInventory = async function (req, res, next) {
  try {
    const payload = {
      classification_id: Number(req.body.classification_id),
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: Number(req.body.inv_price),
      inv_miles: Number(req.body.inv_miles),
      inv_color: req.body.inv_color
    }

    const row = await invModel.addVehicle(payload)
    if (row?.inv_id) {
      req.flash("notice", "Vehicle added.")
      const nav = await utilities.getNav()
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav
      })
    }

    req.flash("notice", "Insert failed.")
    const classificationList = await utilities.buildClassificationList(payload.classification_id)
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      classificationList,
      ...payload
    })
  } catch (err) { next(err) }
}


module.exports = invCont