// routes/errorRoute.js
const express = require('express');
const router = express.Router();

const intentionalError = require('../middleware/intentionalError');



router.get('/test', intentionalError, (req, res) => {
  // won't run because middleware above throws
  res.send('You reached the controller.');
});



module.exports = router;
