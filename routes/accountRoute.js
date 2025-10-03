// routes/accountRoute.js
const express = require('express');
const router  = express.Router();

const accountsController = require('../controllers/accountsController');
const utilities          = require('../utilities');
const validate           = require('../utilities/account-validation');

// ✅ import the specific middleware functions by name
const { requireAuth, redirectIfAuthed } = require('../utilities/auth');

/* ===========================
   Account routes
   =========================== */

// Default /account → Account Management (protected)
router.get(
  '/',
  requireAuth,
  utilities.handleErrors(accountsController.buildManagement) // or buildAccount if that's your name
);

// Public: Login & Register
router.get('/login',    redirectIfAuthed, utilities.handleErrors(accountsController.buildLogin));
router.get('/register', redirectIfAuthed, utilities.handleErrors(accountsController.buildRegister));

// Registration (POST)
router.post(
  '/register',
  validate.registrationRules(),
  validate.checkRegDataFlash,
  utilities.handleErrors(accountsController.registerAccount)
);

// Login (POST)
// If your controller uses `login` instead of `accountLogin`, change the next line accordingly.
router.post(
  '/login',
  validate.loginRules(),
  validate.checkLoginDataFlash,
  utilities.handleErrors(accountsController.accountLogin) // ← use .login if that's your function name
);

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  req.flash('notice', 'You have been logged out.');
  res.redirect('/');
});

// Update account page (GET)
router.get(
  '/update/:account_id',
  requireAuth,
  utilities.handleErrors(accountsController.buildUpdateView)
);

// Update account (names/email) (POST)
router.post(
  '/update',
  requireAuth,
  validate.updateAccountRules(),
  validate.checkUpdateAccountFlash,
  utilities.handleErrors(accountsController.updateAccount)
);

// Update password (POST)
router.post(
  '/update-password',
  requireAuth,
  validate.updatePasswordRules(),
  validate.checkUpdatePasswordFlash,
  utilities.handleErrors(accountsController.updatePassword)
);

module.exports = router;
