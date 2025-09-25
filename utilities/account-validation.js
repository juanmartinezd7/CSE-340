// utilities/account-validation.js
const { body, validationResult } = require('express-validator');
const accountModel = require('../models/account-model');

const validate = {};

/* ------- Register rules ------- */
validate.registrationRules = () => ([
  body('account_firstname')
    .trim().notEmpty().withMessage('First name is required.')
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters.')
    .matches(/^[A-Za-z][A-Za-z' -]*$/).withMessage("First name: letters, apostrophe, space, hyphen only."),
  body('account_lastname')
    .trim().notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters.')
    .matches(/^[A-Za-z][A-Za-z' -]*$/).withMessage("Last name: letters, apostrophe, space, hyphen only."),
  body('account_email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Enter a valid email.')
    .normalizeEmail()
    .custom(async (value) => {
      const exists = await accountModel.checkExistingEmail(value);
      if (exists) {
        throw new Error('Email exists. Please log in or use a different email.');
      }
      return true;
    }),
  body('account_password')
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/)
    .withMessage('Password must be 12+ chars, include 1 uppercase, 1 number, and 1 special character.')
]);

/* ------- Register: flash errors and re-render ------- */
validate.checkRegDataFlash = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    result.array().forEach(err => req.flash('notice', `${prettyLabel(err.param)}: ${err.msg}`));
    return res.status(400).render('account/register', {
      title: 'Register',
      errors: result.mapped(), // optional: show inline field errors too
      account_firstname: req.body.account_firstname,
      account_lastname:  req.body.account_lastname,
      account_email:     req.body.account_email
    });
  }
  next();
};

/* ------- Login rules ------- */
validate.loginRules = () => ([
  body('account_email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Enter a valid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
]);

validate.checkLoginDataFlash = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    result.array().forEach(err => req.flash('notice', `${prettyLabel(err.param)}: ${err.msg}`));
    return res.status(400).render('account/login', {
      title: 'Account Login',
      account_email: req.body.account_email || ''
    });
  }
  next();
};

function prettyLabel(param){
  switch(param){
    case 'account_firstname': return 'First name';
    case 'account_lastname':  return 'Last name';
    case 'account_email':     return 'Email';
    case 'account_password':  return 'Password';
    case 'email':             return 'Email';
    case 'password':          return 'Password';
    default: return param;
  }
}

module.exports = validate;
