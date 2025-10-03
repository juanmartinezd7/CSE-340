//utilities/auth.js

const jwt = require('jsonwebtoken');
const Util = require('.');

function requireAuth(req, res, next) {
  const token = req.cookies?.jwt;
  if (!token) return res.redirect('/account/login');

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.locals.account = decoded; // handy to have in views
    next();
  } catch (err) {
    res.clearCookie('jwt');
    return res.redirect('/account/login');
  }
}

// Optional: if already logged in, skip login/register screens
function redirectIfAuthed(req, res, next) {
  const token = req.cookies?.jwt;
  if (!token) return next();
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.redirect('/account');
  } catch {
    return next();
  }
}

/** Make the logged-in user (if any) available to all views */
function restoreUser(req, res, next) {
  const token = req.cookies?.jwt;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.locals.account = decoded; // { account_id, account_firstname, account_type, ... }
  } catch {
    res.clearCookie('jwt');
  }
  next();
}

/** Require a valid JWT AND an allowed role (default: Employee or Admin) */
function requireStaff(allowed = ['Employee', 'Admin']) {
  return (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) {
      req.flash('notice', 'Please log in to continue.');
      return res.status(401).render('account/login', { title: 'Account Login' });
    }
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.account = decoded;
      if (!allowed.includes(decoded.account_type)) {
        req.flash('notice', 'You are not authorized to access that page.');
        return res.status(403).render('account/login', { title: 'Account Login' });
      }
      next();
    } catch (err) {
      res.clearCookie('jwt');
      req.flash('notice', 'Your session expired. Please log in again.');
      return res.status(401).render('account/login', { title: 'Account Login' });
    }
  };
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


module.exports = { requireAuth, redirectIfAuthed, restoreUser, requireStaff };
