import express, { Request, Response } from "express";
import { logger } from "../logger";
import { adminAuthRequired } from "../middleware/auth";
import { cleanBody } from "../middleware/sanitize";
import { Admin } from "../models/admin";
import { Customer } from "../models/customer";

async function signIn(req: Request, res: Response) {
  try {
    logger.debug(req.body);
    let { email, password } = req.body;
    let filter = { email };

    let exists = await Admin.exists(filter).exec();
    if (exists) {
      let admin = await Admin.findOne(filter, {
        f_name: 1,
        l_name: 1,
        password: 1,
      }).exec();

      if (!admin) {
        res.sendStatus(401);
        return;
      }

      if (await admin.passwordMatch(password)) {
        req.session.admin_id = admin.id;
        await req.session.save();

        let c = admin.toObject() as any;
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
    let admin = await Admin.findById(id, { f_name: 1, l_name: 1 }).exec();

    if (!admin) {
      res.sendStatus(401);
      return;
    }

    res.status(200);
    res.json(admin);
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
    let admin = await Admin.findById(id, {
      f_name: 1,
      l_name: 1,
      email: 1,
      dob: 1,
      image: 1,
    }).exec();

    if (!admin) {
      res.sendStatus(401);
      return;
    }

    res.status(200);

    let object = admin.toObject() as any;

    res.json(object);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function statsByGender(req: Request, res: Response) {
  try {
    let data = await Customer.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          gender: "$_id",
          count: 1,
          sum: 1,
        },
      },
    ]);
    res.json(data);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function statsByAge(req: Request, res: Response) {
  try {
    let data = await Customer.aggregate([
      {
        $project: {
          date: "$dob",
          age: {
            $divide: [
              { $subtract: [new Date(), "$dob"] },
              365 * 24 * 60 * 60 * 1000,
            ],
          },
        },
      },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [18, 30, 40, 50, 1000],
        },
      },
      {
        $addFields: {
          lowerBound: "$_id",
          upperBound: {
            $arrayElemAt: [
              [18, 30, 40, 50, 1000],
              {
                $add: [
                  {
                    $indexOfArray: [[18, 30, 40, 50, 1000], "$_id"],
                  },
                  1,
                ],
              },
            ],
          },
        },
      },
    ]);
    res.json(data);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

export function adminRouter() {
  const router = express.Router();

  router.use(cleanBody);
  router.post("/session/new", signIn);
  router.get("/session", adminAuthRequired, sessionDetails);
  router.delete("/session", adminAuthRequired, signOut);
  router.get("/me", adminAuthRequired, Me);
  router.get("/stats/by-gender", adminAuthRequired, statsByGender);
  router.get("/stats/by-age", adminAuthRequired, statsByAge);

  return router;
}
