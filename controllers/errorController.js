// controllers/errorController.js

// This controller won't be reached in middleware throws first,
// but it's here to prove the request flowed through the router/controller chain.
exports.noteReached = (req, res) => {
  // If middleware didn't throw, this will display:
  res.send('You reached the controller (no error thrown).');
};


