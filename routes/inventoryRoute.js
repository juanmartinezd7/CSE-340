//routes/inventoryRoute.js
// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Task 1: management
router.get("/", utilities.handleErrors(invController.buildManagement))

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Task 2: add classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post("/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassification,
  utilities.handleErrors(invController.addClassification)
)

// Task 3: add inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post("/add-inventory",
  invValidate.vehicleRules(),
  invValidate.checkVehicle,
  utilities.handleErrors(invController.addInventory)
)

// NEW: Vehicle detail
router.get("/detail/:invId",
  utilities.handleErrors(invController.buildByInvId))

module.exports = router;