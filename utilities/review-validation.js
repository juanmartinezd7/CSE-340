// utilities/review-validation.js
const { body, validationResult } = require("express-validator");

const reviewValidate = {};

reviewValidate.updateRules = () => ([
  body("review_text")
    .trim()
    .notEmpty().withMessage("Review text is required.")
    .isLength({ min: 3, max: 2000 }).withMessage("Review must be 3–2000 characters."),
  body("review_id").toInt().isInt().withMessage("Invalid review id."),
]);

reviewValidate.checkUpdate = async (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  result.array().forEach(e => req.flash("notice", e.msg));
  // Send back to the edit page; keep sticky text
  const review_id = parseInt(req.body.review_id, 10);
  return res.status(400).render("reviews/edit", {
    title: "Edit Review",
    review_id,
    inv_id: parseInt(req.body.inv_id, 10),
    review_text: req.body.review_text || "",
  });
};

module.exports = reviewValidate;
