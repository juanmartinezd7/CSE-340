// routes/accountRoute.js
const express = require('express');
const router = express.Router();

const accountsController = require('../controllers/accountsController');
const utilities = require('../utilities');
const validate = require('../utilities/account-validation');
const auth = require('../utilities/auth');            // <-- ADD THIS

// Default /account → account management (protected)
router.get('/', auth.requireAuth, utilities.handleErrors(accountsController.buildAccount));

// Login / Register (redirect away if already authed)
router.get('/login',    auth.redirectIfAuthed, utilities.handleErrors(accountsController.buildLogin));
router.get('/register', auth.redirectIfAuthed, utilities.handleErrors(accountsController.buildRegister));

// Update account (GET)
router.get('/update/:account_id',
  auth.requireAuth,
  utilities.handleErrors(accountsController.buildUpdateView)
);

// Update account (POST)
router.post('/update',
  auth.requireAuth,
  validate.updateAccountRules(),
  validate.checkUpdateAccountFlash,
  utilities.handleErrors(accountsController.updateAccount)
);

// Update password (POST)
router.post('/update-password',
  auth.requireAuth,
  validate.updatePasswordRules(),
  validate.checkUpdatePasswordFlash,
  utilities.handleErrors(accountsController.updatePassword)
);

// Register
router.post('/register',
  validate.registrationRules(),
  validate.checkRegDataFlash,
  utilities.handleErrors(accountsController.registerAccount)
);

// Login
router.post('/login',
  validate.loginRules(),
  validate.checkLoginDataFlash,
  utilities.handleErrors(accountsController.accountLogin)
);

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  req.flash('notice', 'You have been logged out.');
  res.redirect('/');
});

module.exports = router;
