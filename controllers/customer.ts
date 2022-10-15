import express, { Request, Response } from "express";
import mongoose, { get } from "mongoose";
import { logger } from "../logger";
import { customerAuthRequired } from "../middleware/auth";
import { cleanBody } from "../middleware/sanitize";
import { Customer } from "../models/customer";
import { CustomerPaymentMethod } from "../models/customer-payment";
import { sendCustomerVerificationEmail } from "../sendgrid";
import { errorResponse } from "../utiles";
const Product = require("../models/Product");

async function signUp(req: Request, res: Response) {
  try {
    logger.debug(req.body);
    let customer = new Customer(req.body);
    let { _id } = await customer.save();

    await sendCustomerVerificationEmail(
      customer.email,
      customer.verification_code
    );
    res.status(200);
    res.json({ _id });
    return;
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
    return;
  }
}

async function verify(req: Request, res: Response) {
  try {
    let customer_id: string, code: string;

    try {
      customer_id = Buffer.from(req.query.id as any, "base64").toString(
        "ascii"
      );
      code = req.query.code as any;
      logger.debug(req.query);
    } catch (e) {
      res.sendStatus(400);
      logger.error(e);
      return;
    }

    let customer = await Customer.findById(customer_id, {
      verified: 1,
      verification_code: 1,
    });

    if (!customer) {
      res.sendStatus(404);
      return;
    }

    if (customer.verified) {
      res.sendStatus(200);
      return;
    }

    logger.debug(customer.verification_code);
    logger.debug(code);

    if (customer.verification_code !== code) {
      res.sendStatus(401);
      return;
    }

    customer.verified = true;

    await customer.save();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
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
        _id: 1,
        f_name: 1,
        l_name: 1,
        password: 1,
        verified: 1,
      }).exec();

      if (!customer) {
        res.status(401).json(
          errorResponse({
            message: "Customer does not exist. Sign Up first.",
          })
        );
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
        res
          .status(400)
          .json(errorResponse({ message: "Password does not match." }));
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
    let customer = await Customer.findById(id, { f_name: 1, l_name: 1 }).exec();

    if (!customer) {
      res.sendStatus(401);
      return;
    }

    res.status(200);
    res.json(customer);
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
      image: 1,
      _id: 1,
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
    const allowed = ["f_name", "l_name", "email", "dob", "image"];
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

async function popularProducts(req: Request, res: Response) {
  let limit: number;
  try {
    limit = parseInt(req.params.limit) || 10;
  } catch (e) {
    logger.error(e);
    res.sendStatus(400);
    return;
  }

  logger.debug(limit);
  try {
    let products = await Product.find({})
      .sort({ sold: -1 })
      .limit(limit)
      .exec();
    logger.debug(products);
    res.status(200).json(products);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function addToWishlist(req: Request, res: Response) {
  try {
    let product_id: string = req.body.id;
    let customer = await Customer.findById(req.session.customer_id, {
      wish_list: 1,
    });

    if (!customer) {
      res.sendStatus(400);
      return;
    }

    let exist = false;
    for (let c of customer.wish_list) {
      if (c.equals(product_id)) {
        exist = true;
        break;
      }
    }

    if (!exist) {
      customer.wish_list.push(new mongoose.Types.ObjectId(product_id));
      await customer.save();
    }

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function getWishlist(req: Request, res: Response) {
  try {
    let data = await Customer.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.session.customer_id ?? ""),
        },
      },
      {
        $unwind: {
          path: "$wish_list",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "wish_list",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
      {
        $group: {
          _id: "$_id",
          result: {
            $push: "$result",
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

async function deleteWishlist(req: Request, res: Response) {
  try {
    let id = new mongoose.Types.ObjectId(req.params.id);
    let customer = await Customer.findById(req.session.customer_id, {
      wish_list: 1,
    });

    if (!customer) {
      res.sendStatus(400);
      return;
    }

    for (let i = 0; i < customer.wish_list.length; i++) {
      if (customer.wish_list[i].equals(id)) {
        customer.wish_list.splice(i, 1);
      }
    }

    await customer.save();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function deleteAccount(req: Request, res: Response) {
  try {
    // Check the password
    let customer = await Customer.findById(req.session.customer_id);
    let { password } = req.body;

    if (!customer) {
      res.sendStatus(401);
      logger.debug("Customer not found");
      return;
    }

    if (!(await customer.passwordMatch(password))) {
      res.sendStatus(401);
      logger.debug("Password doesn't match");
      return;
    }

    let result = await Customer.findByIdAndUpdate(req.session.customer_id, {
      disabled: true,
    }).exec();

    logger.debug(result);

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function addCustomerPaymentMethod(req: Request, res: Response) {
  try {
    let body = req.body;
    body.customer_id = req.session.customer_id;

    let payment_method = new CustomerPaymentMethod(req.body);
    await payment_method.save();

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function getCustomerPaymentMethods(req: Request, res: Response) {
  try {
    const projection = {
      name_on_card: 1,
      card_number: 1,
    };

    let payment_methods = await CustomerPaymentMethod.find(
      { customer_id: req.session.customer_id },
      projection
    );

    // Send only the last characters of the card number
    for (let p_method of payment_methods) {
      p_method.card_number = p_method.card_number % 100000;
    }

    res.json(payment_methods);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function deleteCustomerPaymentMethods(req: Request, res: Response) {
  try {
    let id = req.params.id;
    let method = await CustomerPaymentMethod.findOne({
      customer_id: req.session.customer_id,
      _id: id,
    });

    if (!method) {
      res.sendStatus(400);
      return;
    }

    let result = await method.delete();

    logger.debug(result);
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
    logger.error(e);
  }
}

async function patchCustomerPaymentMethod(req: Request, res: Response) {
  try {
    let body = req.body;
    let id = req.params.id;
    let update: any = {};

    // Allow only fields in allowed to be updated.
    let allowed = ["default"];

    for (let key in body) {
      if (allowed.includes(key)) {
        update[key] = { $set: body[key] };
      }
    }

    let result = await CustomerPaymentMethod.findOneAndUpdate(
      { _id: id, customer_id: req.session.customer_id },
      update
    );

    if (!result) {
      res.sendStatus(400);
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

  router.use(cleanBody);
  router.post("/sign-up", signUp);
  router.post("/session/new", signIn);
  router.get("/products/popular", popularProducts);
  router.get("/session", customerAuthRequired, sessionDetails);
  router.delete("/session", customerAuthRequired, signOut);
  router.get("/me", customerAuthRequired, Me);
  router.patch("/me", customerAuthRequired, patchMe);
  router.post("/me/delete", customerAuthRequired, deleteAccount);
  router.get("/verify", verify);
  router.post(
    "/payment-method",
    customerAuthRequired,
    addCustomerPaymentMethod
  );
  router.get(
    "/payment-method",
    customerAuthRequired,
    getCustomerPaymentMethods
  );
  router.delete(
    "/payment-method/:id",
    customerAuthRequired,
    deleteCustomerPaymentMethods
  );
  router.patch(
    "/payment-method/:id",
    customerAuthRequired,
    patchCustomerPaymentMethod
  );
  router.post("/wishlist", customerAuthRequired, addToWishlist);
  router.get("/wishlist", customerAuthRequired, getWishlist);
  router.delete("/wishlist/:id", customerAuthRequired, deleteWishlist);

  return router;
}
