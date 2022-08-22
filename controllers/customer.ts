import express, { Request, Response } from "express";

function sayHello(req: Request, res: Response) {
  res.send("Hello");
}

export function customerRouter() {
  const router = express.Router();

  router.get("/hello", sayHello);

  return router;
}
