import express, { Request, Response } from "express";
import { logger } from "../logger";
import { customerAuthRequired } from "../middleware/auth";
import { Customer } from "../models/customer";

async function signUp(req: Request, res: Response) {
  try {
    logger.debug(req.body);
    let customer = new Customer(req.body);
    await customer.save();
    res.sendStatus(200);
    return;
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
    return;
  }
}

async function signIn(req: Request, res: Response) {
  try {
    logger.debug(req.body);
    let { email, password } = req.body;
    let filter = { email };

    let exists = await Customer.exists(filter).exec();
    if (exists) {
      let customer = await Customer.findOne(filter).exec();
      if (await customer?.passwordMatch(password)) {
        req.session.customer_id = customer?.id;
        res.sendStatus(200);
        return;
      } else {
        res.sendStatus(400);
        return;
      }
    }
    res.sendStatus(401);
    return;
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

export function customerRouter() {
  const router = express.Router();

  router.post("/sign-up", signUp);
  router.post("/sign-in", signIn);
  return router;
}
