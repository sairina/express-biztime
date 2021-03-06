const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError")
const db = require("../db")

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT code, name FROM companies;`
    );
    return res.json({ companies: result.rows });
  }
  catch (err) {
    return next(err);
  }
});

router.get("/:code", async function (req, res, next) {
  try {
    const code = req.params.code;

    const result = await db.query(
      `SELECT code, name, description
      FROM companies
      WHERE code=$1`, [code]
    );

    if (result.rows.length === 0) throw new ExpressError("Company doesn't exist in our database", 404);

    return res.json({ company: result.rows[0] });
  }
  catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { code, name, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json(result.rows[0]);
  }
  catch (err) {
    return next(err);
  }
});

router.put("/:code", async function(req, res, next){
  try {
    const { name, description} = req.body;

    const result = await db.query(
      `UPDATE companies 
      SET name=$1, description=$2
      WHERE code = $3
      RETURNING code, name, description`,
      [name, description, req.params.code]
    );
    if (result.rows.length === 0) throw new ExpressError("Company doesn't exist in our database", 404);

    return res.json({"company": result.rows[0]});
  }
  catch (err) {
    return next(err);
  }
});

router.delete("/:code", async function(req, res, next){
  try{
    const result = await db.query(
      `DELETE FROM companies WHERE code = $1
      RETURNING code`,
      [req.params.code]
    );

    if (result.rows.length === 0) throw new ExpressError("Company doesn't exist in our database", 404);

    return res.json({status: "deleted"});
  }
  catch(err){
    return next(err);
  }
});

module.exports = router;