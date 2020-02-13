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



module.exports = router;