
// routes/reviewRoute.js
const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const auth = require('../utilities/auth');
const utilities = require('../utilities');
const reviewController = require('../controllers/reviewController'); // <- exact path/name
const reviewValidate = require("../utilities/review-validation");

// POST /reviews/add  (Create a review)
router.post(
  '/add',
  auth.requireAuth, // must be logged in
  body('review_text').trim().isLength({ min: 3 }).withMessage('Review must be at least 3 characters.'),
  body('inv_id').toInt().isInt({ min: 1 }).withMessage('Invalid vehicle id.'),
  utilities.handleErrors(reviewController.addReview) // <-- pass the function, no ()
);

// Edit review (form)
router.get(
  "/edit/:review_id",
  auth.requireAuth,
  utilities.handleErrors(reviewController.buildEditReview)
);

// Update review (submit)
router.post(
  "/update",
  auth.requireAuth,
  reviewValidate.updateRules(),
  reviewValidate.checkUpdate,
  utilities.handleErrors(reviewController.updateReview)
);

// Delete review (confirm view)
router.get(
  "/delete/:review_id",
  auth.requireAuth,
  utilities.handleErrors(reviewController.buildDeleteReview)
);

// Delete review (submit)
router.post(
  "/delete",
  auth.requireAuth,
  utilities.handleErrors(reviewController.deleteReview)
);

module.exports = router;




