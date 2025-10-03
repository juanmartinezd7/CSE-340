// routes/inventoryRoute.js
const express = require("express");
const router = new express.Router();

const invController = require("../controllers/invController");
const utilities     = require("../utilities");
const invValidate   = require("../utilities/inventory-validation");
const { requireStaff } = require("../utilities/auth");

// ---------- PUBLIC ----------
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
);

// ---------- STAFF-ONLY ----------
router.get(
  "/",
  requireStaff(), // Employee/Admin
  utilities.handleErrors(invController.buildManagement)
);

router.get(
  "/add-classification",
  requireStaff(),
  utilities.handleErrors(invController.buildAddClassification)
);
router.post(
  "/add-classification",
  requireStaff(),
  invValidate.classificationRules(),
  invValidate.checkClassification,
  utilities.handleErrors(invController.addClassification)
);

router.get(
  "/add-inventory",
  requireStaff(),
  utilities.handleErrors(invController.buildAddInventory)
);
router.post(
  "/add-inventory",
  requireStaff(),
  invValidate.vehicleRules(),
  invValidate.checkVehicle,
  utilities.handleErrors(invController.addInventory)
);

router.get(
  "/edit/:inv_id",
  requireStaff(),
  utilities.handleErrors(invController.buildEditInventory)
);
router.post(
  "/update",
  requireStaff(),
  invValidate.vehicleRules(),
  invValidate.checkUpdateData, // your existing update validator
  utilities.handleErrors(invController.updateInventory)
);

router.get(
  "/delete/:inv_id",
  requireStaff(),
  utilities.handleErrors(invController.buildDeleteInventory)
);
router.post(
  "/delete",
  requireStaff(),
  utilities.handleErrors(invController.deleteInventory) // your delete executor
);

// JSON used by the management screen’s dropdown/table
router.get(
  "/getInventory/:classification_id",
  requireStaff(),
  utilities.handleErrors(invController.getInventoryJSON)
);

module.exports = router;
