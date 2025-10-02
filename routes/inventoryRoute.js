// routes/inventoryRoute.js
const express = require("express");
const router = new express.Router();

const invController = require("../controllers/invController");
const utilities     = require("../utilities");
const invValidate   = require("../utilities/inventory-validation");

// Management
router.get("/", utilities.handleErrors(invController.buildManagement));

// By classification
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Vehicle detail
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
);

// Add classification (GET + POST)
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassification,
  utilities.handleErrors(invController.addClassification)
);

// Add inventory (GET + POST)
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);
router.post(
  "/add-inventory",
  invValidate.vehicleRules(),
  invValidate.checkVehicle,
  utilities.handleErrors(invController.addInventory)
);

// Edit inventory (form)
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.buildEditInventory)
);

// Update inventory (submit)
router.post(
  "/update",
  invValidate.vehicleRules(),
  invValidate.checkUpdateData, // <- make sure this exists in inventory-validation.js
  utilities.handleErrors(invController.updateInventory)
);

// JSON for management table
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

module.exports = router;
