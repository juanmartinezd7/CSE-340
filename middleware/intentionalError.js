// middleware/intentionalError.js

module.exports = (req, res, next) => {
  const err = new Error('Intentional 500 test');
  err.status = 500;
  next(err);
};
