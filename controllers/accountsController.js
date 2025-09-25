//controllers/accountsController.js

/* ****************************************
*  Deliver login view
* *************************************** */

const bcrypt = require('bcryptjs');
const accountModel = require('../models/account-model');

// GET /account
async function buildLogin(req, res) {
  res.render('account/login', { title: 'Account Login' });
}

// GET /account/register
// controllers/accountsController.js
async function buildRegister(req, res) {
  res.render('account/register', {
    title: 'Register',
    errors: {},               // <-- ensure defined
    account_firstname: '',
    account_lastname: '',
    account_email: ''
  });
}


// POST /account/register  (validation already ran in middleware)
async function registerAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body || {};

    const passwordHash = bcrypt.hashSync(account_password, 10);
    const row = await accountModel.registerAccount(
      account_firstname, account_lastname, account_email, passwordHash
    );

    if (row && row.account_id) {
      req.flash?.('notice', `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render('account/login', { title: 'Account Login' });
    }

    // fallback
    req.flash?.('notice', 'Registration failed.');
    return res.status(500).render('account/register', {
      title: 'Register',
      account_firstname,
      account_lastname,
      account_email
    });
  } catch (err) {
    // duplicate email (Postgres)
    if (err.code === '23505') {
      req.flash?.('notice', 'That email is already registered.');
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

// POST /account/login
/*async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await accountModel.getAccountByEmail(email); // ensure this exists in your model

    if (!user) {
      req.flash?.('notice', 'Invalid email or password.');
      return res.status(400).render('account/login', { title: 'Account Login', email });
    }

    const ok = bcrypt.compareSync(password, user.account_password);
    if (!ok) {
      req.flash?.('notice', 'Invalid email or password.');
      return res.status(400).render('account/login', { title: 'Account Login', email });
    }

    // success (add session here if wanted)
    req.flash?.('notice', `Welcome back, ${user.account_firstname}!`);
    return res.redirect('/');
  } catch (err) {
    next(err);
  }
}*/

// POST /account/login
async function buildLogin(req, res) {
  res.render('account/login', {
    title: 'Account Login',
    account_email: ''   // empty default so EJS always has a value
  });
}

async function login(req, res, next) {
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

    req.flash('notice', `Welcome back, ${user.account_firstname}!`);
    return res.redirect('/');
  } catch (err) {
    next(err);
  }
}



module.exports = { buildLogin, buildRegister, registerAccount, login };
