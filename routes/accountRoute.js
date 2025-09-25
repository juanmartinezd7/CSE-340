// routes/accountRoute.js

const express = require('express');
const router = express.Router();

const accountsController = require('../controllers/accountsController');
const utilities = require('../utilities');
const validate = require('../utilities/account-validation');

router.get('/',         utilities.handleErrors(accountsController.buildLogin));
router.get('/login',    utilities.handleErrors(accountsController.buildLogin));
router.get('/register', utilities.handleErrors(accountsController.buildRegister));

router.post('/register',
  validate.registrationRules(),
  validate.checkRegDataFlash,
  utilities.handleErrors(accountsController.registerAccount)
);

router.post('/login',
  validate.loginRules(),
  validate.checkLoginDataFlash,
  utilities.handleErrors(accountsController.login)
);

// Process the login attempt
router.post(
  '/login',
  validate.loginRules(),
  validate.checkLoginDataFlash,
  utilities.handleErrors(accountsController.login)
);

module.exports = router;





