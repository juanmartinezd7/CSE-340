// routes/errorRoute.js
const express = require('express');
const router = express.Router();

const intentionalError = require('../middleware/intentionalError');
//const errorController = require('../controllers/errorController');

// /error/test → goes through router, middleware (throws), then controller (won't run),
// then app-level error handler renders errors/error.ejs

//old
//router.get('/test', intentionalError, errorController.noteReached);


router.get('/test', intentionalError, (req, res) => {
  // won't run because middleware above throws
  res.send('You reached the controller.');
});



// Optional:
// const errorController = require('../controllers/errorController');
// router.get('/test', errorController.trigger);

module.exports = router;
