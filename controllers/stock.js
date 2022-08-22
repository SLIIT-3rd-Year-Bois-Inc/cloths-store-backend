import express, { Request, Response } from "express";

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
function sayHello(req, res) {
  res.send("Hello");
}

export function stockRouter() {
  const router = express.Router();

  router.get("/hello", sayHello);

  return router;
}
