//models/account-model.js

/* *****************************
*   Register new account
* *************************** */

// models/account-model.js
const pool = require('../database/');

/* Register new account */
async function registerAccount(first, last, email, passwordHash) {
  const sql = `
    INSERT INTO public.account
      (account_firstname, account_lastname, account_email, account_password, account_type)
    VALUES ($1, $2, $3, $4, 'Client')
    RETURNING account_id
  `;
  const result = await pool.query(sql, [first, last, email, passwordHash]);
  return result.rows[0]; // { account_id: ... }
}

/* ------------------------------
 * Get account by ID
 * ----------------------------- */
async function getAccountById(account_id) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type
    FROM public.account
    WHERE account_id = $1
    LIMIT 1
  `;
  const r = await pool.query(sql, [account_id]);
  return r.rows[0] || null;
}

/* ------------------------------
 * Update account (name + email)
 * ----------------------------- */
async function updateAccount({ account_id, account_firstname, account_lastname, account_email }) {
  const sql = `
    UPDATE public.account
       SET account_firstname = $1,
           account_lastname  = $2,
           account_email     = $3
     WHERE account_id       = $4
  `;
  const r = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
  return r.rowCount === 1;
}

/* ------------------------------
 * Update password (hashed)
 * ----------------------------- */
async function updatePassword(account_id, passwordHash) {
  const sql = `
    UPDATE public.account
       SET account_password = $1
     WHERE account_id       = $2
  `;
  const r = await pool.query(sql, [passwordHash, account_id]);
  return r.rowCount === 1;
}


/* Check for existing email (boolean) */
async function checkExistingEmail(email) {
  const sql = `SELECT 1 FROM public.account WHERE LOWER(account_email) = LOWER($1) LIMIT 1`;
  const r = await pool.query(sql, [email]);
  return r.rowCount > 0;
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword };





