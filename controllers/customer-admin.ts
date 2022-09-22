import express, { Request, Response } from "express";
import { logger } from "../logger";
import { Customer } from "../models/customer";

async function customers(req: Request, res: Response) {
  let from, to: number;
  try {
    from = parseInt(req.params.from);
    to = parseInt(req.params.to);
  } catch (e) {
    logger.error(e);
    res.sendStatus(400);
    return;
  }

  try {
    const total = await Customer.find().count().exec();
    const projection = {
      f_name: 1,
      l_name: 1,
      email: 1,
    };

    const data = await Customer.find({}, projection)
      .skip(from)
      .limit(to - from)
      .exec();

    res.status(200).json({ data, total: total });
  } catch (e) {
    logger.error(e);
    res.sendStatus(500);
  }
}

export function customerAdminRouter() {
  const router = express.Router();

  router.get("/all", customers);

  return router;
}
