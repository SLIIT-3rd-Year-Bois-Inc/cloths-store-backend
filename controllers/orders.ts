import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { logger } from "../logger";
import { customerAuthRequired } from "../middleware/auth";
import { aggregateOrdersWithProducts, Order } from "../models/order";

async function placeOrder(req: Request, res: Response) {
  try {
    let body = req.body;
    console.log(body);
    let customer = req.session.customer_id;

    body.customer_id = customer;

    let result = await new Order(body).save();

    if (result) {
      res.sendStatus(200);
      return;
    }

    res.sendStatus(500);
  } catch (e) {
    logger.debug(e);
    res.sendStatus(500);
  }
}

async function getCustomerOrders(req: Request, res: Response) {
  try {
    let from, to: number;
    let from_date: Date;

    try {
      from = parseInt(req.query.from as string) || 0;
      to = parseInt(req.query.to as string) || 10;
      from_date = new Date((req.query.from_date as string) ?? "");
    } catch (e) {
      logger.error(e);
      res.sendStatus(400);
      return;
    }

    try {
      const total = await Order.find().count().exec();
      const data = await Order.aggregate(
        aggregateOrdersWithProducts(req.session.customer_id || "")
      )
        .skip(from)
        .limit(to - from)
        .exec();

      res.status(200).json({ data, total: total });
    } catch (e) {
      logger.debug(e);
      res.sendStatus(500);
    }
  } catch (e) {
    logger.debug(e);
    res.sendStatus(500);
  }
}

async function updateOrder(req: Request, res: Response) {
  try {
  } catch (e) {
    logger.debug(e);
    res.sendStatus(500);
  }
}

async function payForOrder(req: Request, res: Response) {
  try {
  } catch (e) {
    logger.debug(e);
    res.sendStatus(500);
  }
}

async function viewOrder(req: Request, res: Response) {
  try {
  } catch (e) {
    logger.debug(e);
    res.sendStatus(500);
  }
}

async function adminUpdateOrder(req: Request, res: Response) {}

export function orderRouter() {
  const router = express.Router();

  router.post("/", customerAuthRequired, placeOrder);
  router.patch("/:id", customerAuthRequired, updateOrder);
  router.get("/me", customerAuthRequired, getCustomerOrders);

  return router;
}
