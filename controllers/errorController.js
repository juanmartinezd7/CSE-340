// controllers/errorController.js

// This controller won't be reached in middleware throws first,
// but it's here to prove the request flowed through the router/controller chain.
exports.noteReached = (req, res) => {
  // If middleware didn't throw, you'd see this:
  res.send('You reached the controller (no error thrown).');
};

// Alt: controller-triggered error 
// exports.trigger = (req, res, next) => {
//   const err = new Error('Intentional 500 test (from controller)');
//   err.status = 500;
//   next(err);
// };
