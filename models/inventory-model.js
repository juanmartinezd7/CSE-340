//models/inventory-model.js
const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

module.exports = {getClassifications}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.
    query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

module.exports = {getClassifications, getInventoryByClassificationId};

/* ***************************
 *  Get one vehicle by inv_id
 * ************************** */
async function getVehicleByInvId(inv_id){
  const sql = `
    SELECT i.*, c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.inv_id = $1
  `;
  const result = await pool.query(sql, [inv_id])
  return result.rows[0] || null
}

/* Add: create a classification */
async function addClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1) RETURNING classification_id
  `;
  const r = await pool.query(sql, [classification_name]);
  return r.rows[0]; // { classification_id: ... }
}

/* Add: check if classification name exists (case-insensitive) */
async function checkExistingClassificationName(name) {
  const sql = `
    SELECT 1 FROM public.classification
    WHERE LOWER(classification_name) = LOWER($1)
    LIMIT 1
  `;
  const r = await pool.query(sql, [name]);
  return r.rowCount > 0;
}

/* Add: create a vehicle */
async function addVehicle({
  inv_make, inv_model, inv_year, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_miles,
  inv_color, classification_id
}) {
  const sql = `
    INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description,
       inv_image, inv_thumbnail, inv_price, inv_miles,
       inv_color, classification_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING inv_id
  `;
  const params = [
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  ];
  const r = await pool.query(sql, params);
  return r.rows[0]; // { inv_id: ... }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleByInvId,   
  addClassification,
  checkExistingClassificationName,
  addVehicle           
}