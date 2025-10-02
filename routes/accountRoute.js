// routes/accountRoute.js
const express = require('express');
const router = express.Router();

const accountsController = require('../controllers/accountsController');
const utilities = require('../utilities');
const validate = require('../utilities/account-validation');
const auth = require('../utilities/auth'); // <-- add

// DEFAULT /account → Account Management (protected)
router.get('/', auth.requireAuth, utilities.handleErrors(accountsController.buildAccount));

// Login & Register pages
router.get('/login',    auth.redirectIfAuthed, utilities.handleErrors(accountsController.buildLogin));
router.get('/register', auth.redirectIfAuthed, utilities.handleErrors(accountsController.buildRegister));

// Register
router.post(
  '/register',
  validate.registrationRules(),
  validate.checkRegDataFlash,
  utilities.handleErrors(accountsController.registerAccount)
);

// Login
router.post(
  '/login',
  validate.loginRules(),
  validate.checkLoginDataFlash,
  utilities.handleErrors(accountsController.accountLogin)
);

// (Optional) Logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/account/login');
});

module.exports = router;







