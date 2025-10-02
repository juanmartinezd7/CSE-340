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

module.exports = {
  buildLogin,
  buildRegister,
  buildAccount,       // NEW
  registerAccount,
  accountLogin        // renamed for clarity
};
