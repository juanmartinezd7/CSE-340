//utilities/inventory-validation.js
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invValidate = {}

/* ---------- Task 2: add-classification rules ---------- */
invValidate.classificationRules = () => ([
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required.")
    .matches(/^[A-Za-z]+$/).withMessage("Name must be alphabetic characters only (no spaces or symbols).")
    .custom(async (val) => {
      const exists = await invModel.checkExistingClassificationName(val)
      if (exists) throw new Error("That classification already exists.")
      return true
    })
])

invValidate.checkClassification = async (req, res, next) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    result.array().forEach(e => req.flash("notice", e.msg))
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      classification_name: req.body.classification_name || ""
    })
  }
  next()
}

/* ---------- Task 3: add-inventory rules ---------- */
invValidate.vehicleRules = () => ([
  body("classification_id").notEmpty().withMessage("Choose a classification."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").trim().matches(/^\d{4}$/).withMessage("Year must be a 4 digit number."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be zero or more."),
  body("inv_color").trim().notEmpty().withMessage("Color is required.")
])

invValidate.checkVehicle = async (req, res, next) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    result.array().forEach(e => req.flash("notice", e.msg))
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      classificationList,
      ...req.body // sticky fields
    })
  }
  next()
}

module.exports = invValidate
