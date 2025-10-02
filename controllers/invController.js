// controllers/invController.js
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* -----------------------------
 *  Inventory by classification
 *  GET /inv/type/:classificationId
 * ----------------------------- */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classificationId = Number(req.params.classificationId);
    if (!Number.isInteger(classificationId)) {
      return next({ status: 400, message: "Invalid classification id." });
    }

    const rows = await invModel.getInventoryByClassificationId(classificationId);
    const grid = await utilities.buildClassificationGrid(rows || []);
    const className = rows?.[0]?.classification_name || "Vehicles";

    // If your view is /views/classification.ejs:
    return res.render("classification", {
      title: `${className} vehicles`,
      grid,
    });
  } catch (err) {
    next(err);
  }
};

/* -----------------------------
 *  Vehicle detail
 *  GET /inv/detail/:invId
 * ----------------------------- */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const invId = Number(req.params.invId);
    if (!Number.isInteger(invId)) {
      return next({ status: 400, message: "Invalid vehicle id." });
    }

    // Use whatever your model exposes:
    const item =
      (await invModel.getVehicleByInvId?.(invId)) ??
      (await invModel.getInventoryById?.(invId));

    if (!item) return next({ status: 404, message: "Vehicle not found." });

    const title = `${item.inv_year} ${item.inv_make} ${item.inv_model}`;
    const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
      .format(item.inv_price);
    const miles = item.inv_miles != null
      ? new Intl.NumberFormat("en-US").format(item.inv_miles)
      : null;

    return res.render("inventory/detail", { title, item, price, miles });
  } catch (err) {
    next(err);
  }
};

/* -----------------------------
 *  Management dashboard
 *  GET /inv
 * ----------------------------- */
invCont.buildManagement = async function (req, res, next) {
  try {
    const classificationList = await utilities.buildClassificationList();
    return res.render("inventory/management", {
      title: "Vehicle Management",
      classificationList,
    });
  } catch (err) { next(err); }
};

/* -----------------------------
 *  Add classification (form)
 *  GET /inv/add-classification
 * ----------------------------- */
invCont.buildAddClassification = async function (req, res) {
  return res.render("inventory/add-classification", {
    title: "Add New Classification",
    classification_name: "",
  });
};

/* -----------------------------
 *  Add classification (submit)
 *  POST /inv/add-classification
 * ----------------------------- */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    const row = await invModel.addClassification(classification_name);

    if (row?.classification_id) {
      req.flash("notice", `“${classification_name}” added.`);
      // Rebuild nav for this response so the new item shows immediately
      const nav = await utilities.getNav();
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationList: await utilities.buildClassificationList(),
      });
    }

    req.flash("notice", "Insert failed.");
    return res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      classification_name,
    });
  } catch (err) { next(err); }
};

/* -----------------------------
 *  Add inventory (form)
 *  GET /inv/add-inventory
 * ----------------------------- */
invCont.buildAddInventory = async function (req, res) {
  const classificationList = await utilities.buildClassificationList();
  return res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    classificationList,
    inv_make: "", inv_model: "", inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image.png",
    inv_price: "", inv_miles: "", inv_color: "",
  });
};

/* -----------------------------
 *  Add inventory (submit)
 *  POST /inv/add-inventory
 * ----------------------------- */
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
      inv_color: req.body.inv_color,
    };

    const row = await invModel.addVehicle(payload);
    if (row?.inv_id) {
      req.flash("notice", "Vehicle added.");
      const nav = await utilities.getNav();
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationList: await utilities.buildClassificationList(),
      });
    }

    req.flash("notice", "Insert failed.");
    const classificationList = await utilities.buildClassificationList(payload.classification_id);
    return res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      classificationList,
      ...payload,
    });
  } catch (err) { next(err); }
};

/* -----------------------------
 *  Edit inventory (form)
 *  GET /inv/edit/:inv_id
 * ----------------------------- */

invCont.buildEditInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    if (!Number.isInteger(inv_id)) {
      return next({ status: 400, message: "Invalid vehicle id." });
    }

    // Get item
    const itemData =
      (await invModel.getInventoryById?.(inv_id)) ??
      (await invModel.getVehicleByInvId?.(inv_id));

    if (!itemData) {
      return next({ status: 404, message: "Vehicle not found." });
    }

    // ✅ Trim year from CHAR(4) to avoid pattern mismatch in the form
    const invYearTrimmed = String(itemData.inv_year ?? "").trim();

    // Build selected classification list
    const classificationList =
      await utilities.buildClassificationList(itemData.classification_id);

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    return res.render("inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      classificationList, // HTML <select>
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: invYearTrimmed,      // ✅ use trimmed value here
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (err) {
    next(err);
  }
};


/* -----------------------------
 *  JSON for management table
 *  GET /inv/getInventory/:classification_id
 * ----------------------------- */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const id = Number(req.params.classification_id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
    const data = await invModel.getInventoryByClassificationId(id);
    return res.json(data);
  } catch (err) { next(err); }
};


//updateInventory
//********************************************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const payload = {
      inv_id: parseInt(req.body.inv_id, 10),
      classification_id: parseInt(req.body.classification_id, 10),
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

    const updated = await invModel.updateVehicle(payload) // implement in your model
    if (updated) {
      req.flash("notice", "Vehicle updated.")
      return res.redirect("/inv/")
    }

    // If the DB write failed, re-render edit with sticky fields
    const classificationList = await utilities.buildClassificationList(payload.classification_id)
    return res.status(500).render("inventory/edit-inventory", {
      title: `Edit ${payload.inv_make} ${payload.inv_model}`,
      classificationList,
      ...payload
    })
  } catch (err) { next(err) }
}


/* ***************************
 *  Build & deliver delete confirmation view
 *  GET /inv/delete/:inv_id
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  try {
    // Collect the id from the URL
    const inv_id = parseInt(req.params.inv_id, 10)
    if (!Number.isInteger(inv_id)) {
      return next({ status: 400, message: "Invalid vehicle id." })
    }

    // Build nav for the view
    const nav = await utilities.getNav()

    // Fetch this inventory item
    const itemData = await (
      invModel.getInventoryById
        ? invModel.getInventoryById(inv_id)
        : invModel.getVehicleByInvId(inv_id) // fallback if your model uses this name
    )

    if (!itemData) {
      return next({ status: 404, message: "Vehicle not found." })
    }

    // Make + Model for title/h1
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    // Render the delete confirmation view
    return res.render("inventory/delete-confirm", {
      title: `Delete ${itemName}`,
      nav,
      errors: null,

      // inputs for the form (read-only in the EJS)
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: String(itemData.inv_year ?? "").trim(),
      inv_price: itemData.inv_price
    })
  } catch (err) {
    next(err)
  }
}

/* -----------------------------
 *  Delete inventory (submit)
 *  POST /inv/delete
 * ----------------------------- */
invCont.deleteInventory = async function (req, res, next) {
  try {
    // collect inv_id from the posted form
    const inv_id = parseInt(req.body.inv_id, 10)
    if (!Number.isInteger(inv_id)) {
      req.flash("notice", "Invalid vehicle id.")
      return res.redirect("/inv/")
    }

    // ask the model to delete this vehicle
    const deleted = await invModel.deleteVehicle(inv_id) // you'll build this in the model next

    if (deleted) {
      // success → back to management with a success flash
      req.flash("notice", "Vehicle deleted.")
      return res.redirect("/inv/")
    }

    // failure → flash and rebuild the same delete view
    req.flash("notice", "Delete failed. Please try again.")
    return res.redirect(`/inv/delete/${inv_id}`)
  } catch (err) {
    next(err)
  }
}



module.exports = {
  buildManagement:         invCont.buildManagement,
  buildByClassificationId: invCont.buildByClassificationId,
  buildByInvId:            invCont.buildByInvId,
  buildAddClassification:  invCont.buildAddClassification,
  addClassification:       invCont.addClassification,
  buildAddInventory:       invCont.buildAddInventory,
  addInventory:            invCont.addInventory,
  buildEditInventory:      invCont.buildEditInventory,
  getInventoryJSON:        invCont.getInventoryJSON,
  updateInventory:         invCont.updateInventory,
  buildDeleteInventory:    invCont.buildDeleteInventory,
  deleteInventory:         invCont.deleteInventory,
};

