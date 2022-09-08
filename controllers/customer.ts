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
      let customer = await Customer.findOne(filter, {
        f_name: 1,
        l_name: 1,
        password: 1,
      }).exec();

      if (!customer) {
        res.sendStatus(401);
        return;
      }

      if (await customer.passwordMatch(password)) {
        req.session.customer_id = customer.id;
        await req.session.save();

        let c = customer.toObject() as any;
        delete c.password;

        res.status(200).json(c);
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
    console.error(e);
  }
}

async function sessionDetails(req: Request, res: Response) {
  try {
    let id = req.session.customer_id;
    let customer = await Customer.findById(id).exec();

    if (!customer) {
      res.sendStatus(401);
      return;
    }

    res.status(200);

    let object = customer.toObject() as any;

    res.json({
      f_name: object.f_name,
      l_name: object.l_name,
    });
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function signOut(req: Request, res: Response) {
  try {
    req.session.destroy(function (err) {
      if (err) {
        res.sendStatus(500);
        logger.error(err);
        return;
      }

      res.sendStatus(200);
    });
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function Me(req: Request, res: Response) {
  try {
    let id = req.session.customer_id;
    let customer = await Customer.findById(id, {
      f_name: 1,
      l_name: 1,
      email: 1,
      dob: 1,
    }).exec();

    if (!customer) {
      res.sendStatus(401);
      return;
    }

    res.status(200);

    let object = customer.toObject() as any;

    res.json(object);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function patchMe(req: Request, res: Response) {
  try {
    let id = req.session.customer_id;
    let update = req.body;

    // Only let update specified fields
    const allowed = ["f_name", "l_name", "email", "dob"];
    const m_update: any = {};

    for (let key in update) {
      if (allowed.includes(key)) {
        m_update[key] = { $set: update[key] };
      }
    }

    logger.debug(update);
    logger.debug(m_update);

    let result = await Customer.findByIdAndUpdate(id, update).exec();

    if (!result) {
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

export function customerRouter() {
  const router = express.Router();

  router.post("/sign-up", signUp);
  router.post("/session/new", signIn);
  router.get("/session", customerAuthRequired, sessionDetails);
  router.delete("/session", customerAuthRequired, signOut);
  router.get("/me", customerAuthRequired, Me);
  router.patch("/me", customerAuthRequired, patchMe);

  return router;
}
