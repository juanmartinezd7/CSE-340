// controllers/accountsController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const accountModel = require('../models/account-model');
const utilities = require('../utilities');

/* ---------- Views ---------- */

// GET /account/login
async function buildLogin(req, res) {
  res.render('account/login', {
    title: 'Account Login',
    account_email: '' // sticky default
  });
}

// GET /account/register
async function buildRegister(req, res) {
  res.render('account/register', {
    title: 'Register',
    errors: {},
    account_firstname: '',
    account_lastname: '',
    account_email: ''
  });
}

// GET /account (default) → Account Management
async function buildAccount(req, res) {
  // (optional) you can check auth here later
  res.render('account/management', {
    title: 'Account Management', // used for <title> and <h1> if you want
  });
}

/* ---------- Actions ---------- */

// POST /account/register (validation already ran)
async function registerAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body || {};
    const passwordHash = bcrypt.hashSync(account_password, 10);

    const row = await accountModel.registerAccount(
      account_firstname, account_lastname, account_email, passwordHash
    );

    if (row && row.account_id) {
      req.flash('notice', `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render('account/login', { title: 'Account Login', account_email });
    }

    req.flash('notice', 'Registration failed.');
    return res.status(500).render('account/register', {
      title: 'Register',
      account_firstname,
      account_lastname,
      account_email
    });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      req.flash('notice', 'That email is already registered.');
      return res.status(400).render('account/register', {
        title: 'Register',
        account_firstname: req.body.account_firstname,
        account_lastname: req.body.account_lastname,
        account_email: req.body.account_email
      });
    }
    next(err);
  }
}

// POST /account/login (validation already ran)
async function accountLogin(req, res, next) {
  try {
    const { account_email, password } = req.body;

    const user = await accountModel.getAccountByEmail(account_email);
    if (!user) {
      req.flash('notice', 'Invalid email or password.');
      return res.status(400).render('account/login', {
        title: 'Account Login',
        account_email
      });
    }

    const ok = bcrypt.compareSync(password, user.account_password);
    if (!ok) {
      req.flash('notice', 'Invalid email or password.');
      return res.status(400).render('account/login', {
        title: 'Account Login',
        account_email
      });
    }

    // Build token payload (no password)
    const { account_password, ...payload } = user;

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const cookieOpts = {
      httpOnly: true,
      maxAge: 60 * 60 * 1000 // 1 hour in ms
    };
    if (process.env.NODE_ENV !== 'development') cookieOpts.secure = true;
    res.cookie('jwt', token, cookieOpts);

    req.flash('notice', `Welcome back, ${user.account_firstname}!`);
    return res.redirect('/account'); // ← redirect to the new default account page
  } catch (err) {
    next(err);
  }
}

// render the view and set a title
async function buildManagement(req, res) {
  res.render('account/management', { title: 'Account Management' });
}

async function buildUpdateAccount(req, res) {
  // basic shell; flesh out later
  res.render('account/update', { title: 'Update Account' });
}

/* -----------------------------------
 * Deliver the Account Update view
 * GET /account/update/:account_id
 * ---------------------------------- */
async function buildUpdateView(req, res) {
  const account_id = parseInt(req.params.account_id, 10);
  const user = await accountModel.getAccountById(account_id);
  if (!user) {
    req.flash('notice', 'Account not found.');
    return res.redirect('/account');
  }

  return res.render('account/update', {
    title: 'Update Account',
    errors: {},
    account_id: user.account_id,
    account_firstname: user.account_firstname,
    account_lastname:  user.account_lastname,
    account_email:     user.account_email
  });
}

/* -----------------------------------
 * Handle Account (names/email) update
 * POST /account/update
 * ---------------------------------- */
async function updateAccount(req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    const ok = await accountModel.updateAccount({
      account_id: Number(account_id),
      account_firstname,
      account_lastname,
      account_email
    });

    if (!ok) {
      req.flash('notice', 'Update failed. Please try again.');
      // re-render update with sticky values
      return res.status(500).render('account/update', {
        title: 'Update Account',
        errors: {},
        account_id,
        account_firstname,
        account_lastname,
        account_email
      });
    }

    // Re-query the updated user
    const fresh = await accountModel.getAccountById(Number(account_id));

    // Optional: refresh JWT so header/welcome uses new name/email on next requests
    try {
      const old = res.locals.account || {};
      const payload = {
        ...old,
        account_id: fresh.account_id,
        account_firstname: fresh.account_firstname,
        account_lastname: fresh.account_lastname,
        account_email: fresh.account_email,
        account_type: fresh.account_type
      };
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', maxAge: 3600 * 1000 });
      res.locals.account = payload; // so the render right now shows updated data
    } catch (_) {}

    req.flash('notice', 'Account information updated.');
    return res.render('account/management', {
      title: 'Account Management'
      // management.ejs reads res.locals.account & messages()
    });
  } catch (err) { next(err); }
}

/* -----------------------------
 * Handle Password change
 * POST /account/update-password
 * ---------------------------- */
async function updatePassword(req, res, next) {
  try {
    const account_id = Number(req.body.account_id);
    const plain = req.body.account_password;

    // validation middleware already checked strength; just hash and save
    const hash = bcrypt.hashSync(plain, 10);
    const ok = await accountModel.updatePassword(account_id, hash);

    if (!ok) {
      req.flash('notice', 'Password update failed. Please try again.');
      const user = await accountModel.getAccountById(account_id);
      return res.status(500).render('account/update', {
        title: 'Update Account',
        errors: {},
        account_id: user?.account_id,
        account_firstname: user?.account_firstname || '',
        account_lastname:  user?.account_lastname  || '',
        account_email:     user?.account_email     || ''
      });
    }

    req.flash('notice', 'Password updated successfully.');
    // No need to refresh JWT unless you include password (you shouldn’t)
    // Show management with success
    const fresh = await accountModel.getAccountById(account_id);
    res.locals.account = {
      account_id: fresh.account_id,
      account_firstname: fresh.account_firstname,
      account_lastname: fresh.account_lastname,
      account_email: fresh.account_email,
      account_type: fresh.account_type
    };

    return res.render('account/management', {
      title: 'Account Management'
    });
  } catch (err) { next(err); }
}

// POST /account/logout
async function logout(req, res) {
  // remove the JWT cookie
  res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' });
  req.flash?.('notice', 'You have been logged out.');
  return res.redirect('/'); // <-- go back to the home view
}


module.exports = {
  buildLogin,
  buildRegister,
  buildAccount,       
  registerAccount,
  accountLogin,   
  buildManagement,   
  buildUpdateAccount,  
  buildUpdateView,
  updateAccount,
  updatePassword,
  logout
};
