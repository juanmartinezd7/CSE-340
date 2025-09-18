/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require('express');
const path = require('path');
const app = express();

const utilities = require('./utilities');

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Make the nav available to every render/partial
app.use(async (req, res, next) => {
  try {
    // pass req if you want active link highlighting
    res.locals.nav = await utilities.getNav(req);
  } catch (err) {
    res.locals.nav = '<ul><li><a href="/" title="Home page">Home</a></li></ul>';
  }
  next();
});

// Routes
const baseController = require('./controllers/baseController');
const inventoryRoutes = require('./routes/inventoryRoute');
// const staticRoutes = require('./routes/static'); // not needed if using express.static above
// app.use(staticRoutes);

app.use('/inv', inventoryRoutes);
//app.get('/', baseController.buildHome);
app.get("/", utilities.handleErrors(baseController.buildHome))

// 404 catch-all (MUST be after all routes)
app.use((req, res) => {
  res.status(404).render('errors/error', {
    title: '404 – Page Not Found',
    message: 'Sorry, we appear to have lost that page.',
  });
});

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

// Local server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
