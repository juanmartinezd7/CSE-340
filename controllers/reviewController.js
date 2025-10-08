// controllers/reviewController.js
const reviewModel = require("../models/review-model");
const { body, validationResult } = require("express-validator");
const utilities = require("../utilities/");

const reviewController = {};

/* =========================
   Validation Rules
   ========================= */
reviewController.addRules = () => [
  body("review_text")
    .trim()
    .notEmpty().withMessage("Review text is required.")
    .isLength({ min: 3, max: 2000 }).withMessage("Review must be 3–2000 characters."),
  body("inv_id")
    .toInt()
    .isInt({ min: 1 }).withMessage("Invalid vehicle id.")
];

reviewController.updateRules = () => [
  body("review_text")
    .trim()
    .notEmpty().withMessage("Review text is required.")
    .isLength({ min: 3, max: 2000 }).withMessage("Review must be 3–2000 characters."),
  body("review_id")
    .toInt()
    .isInt({ min: 1 }).withMessage("Invalid review id.")
];

/* =========================
   Add a review (POST /reviews/add)
   ========================= */
reviewController.addReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const inv_id = Number(req.body.inv_id) || 0;

    if (!errors.isEmpty()) {
      errors.array().forEach(e => req.flash("notice", e.msg));
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    const account = res.locals.account; // set by auth.requireAuth
    if (!account?.account_id) {
      req.flash("notice", "Please log in.");
      return res.redirect(`/account/login?next=/inv/detail/${inv_id}`);
    }

    const row = await reviewModel.addReview(
      req.body.review_text,
      inv_id,
      account.account_id
    );

    req.flash("notice", row?.review_id ? "Review posted." : "Could not save your review. Please try again.");
    return res.redirect(`/inv/detail/${inv_id}`);
  } catch (err) {
    next(err);
  }
};

/* =========================
   Build edit form (GET /reviews/edit/:review_id)
   ========================= */
reviewController.buildEditReview = async (req, res, next) => {
  try {
    const review_id = parseInt(req.params.review_id, 10);
    if (!Number.isInteger(review_id)) return next({ status: 400, message: "Invalid review id." });

    const review = await reviewModel.getReviewById(review_id); // ensure this exists in the model
    if (!review) return next({ status: 404, message: "Review not found." });

    // Only the author may edit
    if (review.account_id !== res.locals.account.account_id) {
      return next({ status: 403, message: "Forbidden" });
    }

    const nav = await utilities.getNav();
    const title = `Edit Review for ${String(review.inv_year).trim()} ${review.inv_make} ${review.inv_model}`;
    return res.render("reviews/edit", {
      title,
      nav,
      errors: null,
      review_id: review.review_id,
      inv_id: review.inv_id,
      review_text: review.review_text
    });
  } catch (err) { next(err); }
};

/* =========================
   Perform update (POST /reviews/edit)
   ========================= */
reviewController.updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const { review_id, inv_id } = req.body;
    const review_text = (req.body.review_text || "").trim();
    const account_id = res.locals.account.account_id;

    if (!errors.isEmpty()) {
      const nav = await utilities.getNav();
      errors.array().forEach(e => req.flash("notice", e.msg));
      return res.status(400).render("reviews/edit", {
        title: "Edit Review",
        nav, errors: null,
        review_id, inv_id, review_text
      });
    }

    const ok = await reviewModel.updateReview(parseInt(review_id, 10), account_id, review_text);
    req.flash("notice", ok ? "Review updated." : "Update failed.");
    return res.redirect("/account");
  } catch (err) { next(err); }
};

/* =========================
   Build delete confirm (GET /reviews/delete/:review_id)
   ========================= */
reviewController.buildDeleteReview = async (req, res, next) => {
  try {
    const review_id = parseInt(req.params.review_id, 10);
    if (!Number.isInteger(review_id)) return next({ status: 400, message: "Invalid review id." });

    const review = await reviewModel.getReviewById(review_id); // ensure this exists in the model
    if (!review) return next({ status: 404, message: "Review not found." });

    // Only the author may delete
    if (review.account_id !== res.locals.account.account_id) {
      return next({ status: 403, message: "Forbidden" });
    }

    const nav = await utilities.getNav();
    const title = `Delete Review for ${String(review.inv_year).trim()} ${review.inv_make} ${review.inv_model}`;
    return res.render("reviews/delete", {
      title,
      nav,
      errors: null,
      review_id: review.review_id,
      inv_id: review.inv_id,
      review_text: review.review_text  // read-only in the view
    });
  } catch (err) { next(err); }
};

/* =========================
   Perform delete (POST /reviews/delete)
   ========================= */
reviewController.deleteReview = async (req, res, next) => {
  try {
    const review_id = parseInt(req.body.review_id, 10);
    const account_id = res.locals.account.account_id;

    const ok = await reviewModel.deleteReview(review_id, account_id);
    req.flash("notice", ok ? "Review deleted." : "Delete failed. Please try again.");
    return res.redirect("/account");
  } catch (err) { next(err); }
};

module.exports = reviewController;
