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

/* Check for existing email (boolean) */
async function checkExistingEmail(email) {
  const sql = `SELECT 1 FROM public.account WHERE LOWER(account_email) = LOWER($1) LIMIT 1`;
  const r = await pool.query(sql, [email]);
  return r.rowCount > 0;
}

module.exports = { registerAccount, checkExistingEmail };





