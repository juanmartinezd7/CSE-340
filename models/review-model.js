// models/review-model.js
const pool = require("../database/")

async function addReview(review_text, inv_id, account_id) {
  const sql = `
    INSERT INTO public.review (review_text, inv_id, account_id)
    VALUES ($1, $2, $3)
    RETURNING review_id
  `;
  const r = await pool.query(sql, [review_text, inv_id, account_id]);
  return r.rows[0]; // { review_id: ... }
}

async function getReviewsForInventory(inv_id) {
  const sql = `
    SELECT r.review_id, r.review_text, r.review_date,
           a.account_firstname, a.account_lastname
    FROM public.review r
    JOIN public.account a ON r.account_id = a.account_id
    WHERE r.inv_id = $1
    ORDER BY r.review_date DESC
  `
  const r = await pool.query(sql, [inv_id])
  return r.rows
}

async function getReviewsByAccount(account_id) {
  const sql = `
    SELECT r.review_id, r.inv_id, r.review_text, r.review_date,
           i.inv_make, i.inv_model, i.inv_year
    FROM public.review r
    JOIN public.inventory i ON r.inv_id = i.inv_id
    WHERE r.account_id = $1
    ORDER BY r.review_date DESC
  `
  const r = await pool.query(sql, [account_id])
  return r.rows
}

async function getByInvId(inv_id) {
  const sql = `
    SELECT r.review_id, r.review_text, r.review_date,
           a.account_firstname, a.account_lastname
    FROM public.review r
    JOIN public.account a ON r.account_id = a.account_id
    WHERE r.inv_id = $1
    ORDER BY r.review_date DESC
  `;
  const r = await pool.query(sql, [inv_id]);
  return r.rows;
}

async function updateReview(review_id, account_id, review_text) {
  // ownership enforced in WHERE
  const sql = `
    UPDATE public.review
    SET review_text = $1, review_date = now()
    WHERE review_id = $2 AND account_id = $3
    RETURNING review_id
  `
  const r = await pool.query(sql, [review_text, review_id, account_id])
  return r.rowCount === 1
}

async function deleteReview(review_id, account_id) {
  const sql = `
    DELETE FROM public.review
    WHERE review_id = $1 AND account_id = $2
  `
  const r = await pool.query(sql, [review_id, account_id])
  return r.rowCount === 1
}

// Fetch reviews for a vehicle (you used this in the detail page)
async function getByInvId(inv_id) {
  const sql = `
    SELECT r.review_id, r.review_text, r.review_date,
           a.account_firstname, a.account_lastname
    FROM public.review r
    JOIN public.account a ON r.account_id = a.account_id
    WHERE r.inv_id = $1
    ORDER BY r.review_date DESC
  `;
  const r = await pool.query(sql, [inv_id]);
  return r.rows;
}

//Helpers for edit/delete Reviews
async function getReviewById(review_id) {
  const sql = `
    SELECT r.review_id, r.review_text, r.review_date, r.account_id, r.inv_id,
           i.inv_make, i.inv_model, i.inv_year
    FROM public.review r
    JOIN public.inventory i ON r.inv_id = i.inv_id
    WHERE r.review_id = $1
    LIMIT 1
  `;
  const r = await pool.query(sql, [review_id]);
  return r.rows[0];
}

module.exports = {
  addReview,
  getReviewsForInventory,
  getReviewsByAccount,
  updateReview,
  deleteReview,
  getByInvId,
  getReviewById,
}
