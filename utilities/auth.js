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


module.exports = { requireAuth, redirectIfAuthed };
