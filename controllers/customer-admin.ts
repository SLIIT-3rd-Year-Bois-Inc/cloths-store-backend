import express, { Request, Response } from "express";
import { logger } from "../logger";
import { adminAuthRequired } from "../middleware/auth";
import { Customer } from "../models/customer";

async function customers(req: Request, res: Response) {
  let from, to: number;
  let query: string = "";
  try {
    from = parseInt(req.query.from as string);
    to = parseInt(req.query.to as string);
    query = (req.query.q ?? "") as string;
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

    const data = await Customer.find(
      !query
        ? {}
        : {
            $or: [
              { l_name: { $regex: query, $options: "i" } },
              { f_name: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
            ],
          },
      projection
    )
      .skip(from)
      .limit(to - from)
      .exec();

    res.status(200).json({ data, total: total });
  } catch (e) {
    logger.error(e);
    res.sendStatus(500);
  }
}

async function getCustomer(req: Request, res: Response) {
  try {
    let { id } = req.params;
    logger.debug(id);
    const customer = await Customer.findById(id).exec();

    if (!customer) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(customer);
  } catch (e) {
    logger.error(e);
    res.sendStatus(500);
  }
}

async function patchCustomer(req: Request, res: Response) {
  try {
    let { id } = req.params;
    let update = req.body;

    // Only let update specified fields
    const allowed = ["f_name", "l_name", "email", "dob"];
    const m_update: any = {};

    for (let key in update) {
      if (allowed.includes(key)) {
        m_update[key] = { $set: update[key] };
      }
    }

    logger.debug(id);
    const customer = await Customer.findByIdAndUpdate(id, m_update).exec();

    if (!customer) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(customer);
  } catch (e) {
    logger.error(e);
    res.sendStatus(500);
  }
}

async function deleteCustomer(req: Request, res: Response) {
  try {
    let { id } = req.params;
  } catch (e) {
    logger.error(e);
    res.sendStatus(500);
  }
}

export function customerAdminRouter() {
  const router = express.Router();

  router.get("/all", customers);
  router.get("/:id", getCustomer);
  router.patch("/:id", patchCustomer);
  router.delete("/:id", deleteCustomer);

  return router;
}
