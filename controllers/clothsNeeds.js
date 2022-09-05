import express, { Request, Response } from "express";
let ClothsNeeds = require("../models/clothsNeeds");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getTags(req, res) {
  ClothsNeeds.find({})
    .then((ClothsNeed) => {
      console.log(ClothsNeed);
      res.json(ClothsNeed);
    })
    .catch((err) => {
      console.log(err);
    });
}

export function clothsNeedsRouter() {
  const router = express.Router();

  router.get("/getTags", getTags);

  return router;
}
