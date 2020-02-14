const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError")
const db = require("../db")

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, comp_code FROM invoices;`
    );
    return res.json({ invoices: result.rows });
  }
  catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const invoiceRes = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices
      WHERE id=$1`,
      [req.params.id]
    );

    if (invoiceRes.rows.length === 0) throw new ExpressError("No such invoice!", 404);

    const companyRes = await db.query(
      `SELECT code, name, description
      FROM companies
      WHERE code=$1`,
      [invoiceRes.rows[0].comp_code]
    );

    let { id, amt, paid, add_date, paid_date } = invoiceRes.rows[0];
    let { code, name, description } = companyRes.rows[0];

    return res.json({
      invoice: {
        id, amt, paid, add_date, paid_date,
        company: { code, name, description }
      }
    });
  }
  catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { comp_code, amt } = req.body;
    
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    // const company = companies.find(c => c.name === comp_code);
    // if (!company) throw new ExpressError("This company does not exist in our database!", 404);

    return res.status(201).json({ "invoice": result.rows[0] });
  }
  catch (err) {
    return next(err);
  }
});

router.put("/:id", async function(req, res, next){
  try{
    const { amt } = req.body;

    const result = await db.query(
      `UPDATE invoices
      SET amt=$1
      WHERE id = $2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, req.params.id]
    );

    if (result.rows.length === 0) throw new ExpressError("No such invoice!", 404);

    return res.json({ "invoice": result.rows[0] });
  }
  catch(err){
    return next(err);
  }
});

router.delete("/:id", async function(req, res, next){
  try{
    const result = await db.query(
      `DELETE FROM invoices
      WHERE id=$1
      RETURNING id`, 
      [req.params.id]
    );

    if (result.rows.length === 0) throw new ExpressError("Invoice doesn't exist in our database", 404);

    return res.json({ status: "deleted" });

  }
  catch(err){
    return next(err);
  }
});

module.exports = router;