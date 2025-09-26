//controllers/baseController.js

const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  //req.flash("notice", "Please Login using your credentials.")
  res.render("index", {title: "Home", nav})
}

module.exports = baseController