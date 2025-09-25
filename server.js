/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const express = require('express');
const path = require('path');
const app = express();
const utilities = require('./utilities');
const errorRoutes = require('./routes/errorRoute');
const bodyParser = require("body-parser")

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Make the nav available to every render/partial
app.use(async (req, res, next) => {
  try {
    // pass req if want active link highlighting
    res.locals.nav = await utilities.getNav(req);
  } catch (err) {
    res.locals.nav = '<ul><li><a href="/" title="Home page">Home</a></li></ul>';
  }
  next();
});

// Parse application/x-www-form-urlencoded (HTML forms)
app.use(express.urlencoded({ extended: false }));
// (optional) Parse JSON bodies if you ever POST JSON
app.use(express.json());


// Routes
const baseController = require('./controllers/baseController');
const inventoryRoute = require('./routes/inventoryRoute');
const accountRoutes = require('./routes/accountRoute');
// const staticRoutes = require('./routes/static'); // not needed if using express.static above
// app.use(staticRoutes);

// server.js (near the top, before app.use('/account', ...))
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // optional

app.use("/account", accountRoutes);
app.use('/inv', inventoryRoute);
// Account routes
//app.use('/account', accountRoute);
app.use("/account", require("./routes/accountRoute"))
//app.get('/', baseController.buildHome);
app.get("/", utilities.handleErrors(baseController.buildHome))

//Intentional
app.use('/error', errorRoutes);   // e.g., http://localhost:5500/error/test

// 404 catch-all (MUST be after all routes)
app.use((req, res) => {
  res.status(404).render('errors/error', {
    title: '404 – Page Not Found',
    message: 'Sorry, we appear to have lost that page.',
  });
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
// Global error handler (keep this LAST)
app.use((err, req, res, next) => {
  const status = Number(err.status) || 500;
  const title = status === 404 ? '404 – Page Not Found' : '500 – Server Error';
  const message =
    status === 404
      ? (err.message || 'Sorry, we appear to have lost that page.')
      : (err.message || 'Oh no! There was a crash. Maybe try a different route?');

  console.error(`Error at: "${req.originalUrl}" [${status}]: ${err.message}`);

  res.status(status).render('errors/error', {
    status,  // <-- pass to view
    title,
    message
    // nav comes from res.locals via your nav middleware
  });
});


// Local server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
