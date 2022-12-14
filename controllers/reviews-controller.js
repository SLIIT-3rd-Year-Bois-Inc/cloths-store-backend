import express from "express";
import { customerAuthRequired } from "../middleware/auth";
import { Customer } from "../models/customer";
const Review = require("../models/reviews");
const page_size = 3;
const router = express.Router();

// Add review
router.post("/addReview", customerAuthRequired, async (req, res) => {
  try {
    let data = req.body;
    data.customerID = req.session.customer_id;

    let customer = await Customer.findById(data.customerID, {
      f_name: 1,
      l_name: 1,
    });

    data.fname = customer.f_name;
    data.lname = customer.l_name;

    const newTest = new Review(data);
    await newTest.save();
  } catch (e) {
    res.status(500).json({ status: "error", message: "something went wrong" });
  }
  res.status(200).json({ status: "ok" });
});

// View Review Report
router.get("/getReviewsRate", async (req, res) => {
  try {
    const pid = req.query.pid;
    const total2 = await Review.countDocuments({
      productID: { $regex: pid },
    });
    let reviewData = await Review.aggregate([
      {
        $match: {
          productID: pid,
        },
      },
      {
        $group: {
          _id: "$rating",
          count: {
            $sum: 1,
          },
        },
      },
    ]).exec();

    let rates = [0, 0, 0, 0, 0];
    let max = 0;

    for (let i = 0; i < reviewData.length; i++) {
      if (reviewData[i]._id == "1")
        rates[0] = (reviewData[i].count / total2) * 100;
      else if (reviewData[i]._id == "2")
        rates[1] = (reviewData[i].count / total2) * 100;
      else if (reviewData[i]._id == "3")
        rates[2] = (reviewData[i].count / total2) * 100;
      else if (reviewData[i]._id == "4")
        rates[3] = (reviewData[i].count / total2) * 100;
      else if (reviewData[i]._id == "5")
        rates[4] = (reviewData[i].count / total2) * 100;
    }

    let temp = rates[0];
    for (let i = 0; i < 5; i++) {
      if (rates[i] > temp) {
        max = i + 1;
        temp = rates[i];
      } else max = i;
    }

    res.json({
      total2,
      rates,
      max,
    });
  } catch (e) {
    res.status(500).json({ status: "error", message: "something went wrong" });
  }
});

// View Reviews
router.get("/getReviews", async (req, res) => {
  try {
    const page = parseInt(req.query.page || "0");
    const serach = req.query.search || "";
    let rating = req.query.rating || "";
    let pid = req.query.pid || "";
    const currentCustomerID = req.session.customer_id;
    const total = await Review.countDocuments({
      review: { $regex: serach, $options: "i" },
      rating: { $regex: rating },
      productID: { $regex: pid },
    });

    Review.find({
      review: { $regex: serach, $options: "i" },
      rating: { $regex: rating },
      productID: { $regex: pid },
    })
      .sort({ _id: "desc" })
      .limit(page_size)
      .skip(page_size * page)
      .then((review) => {
        let mapped = review.map((c) => {
          let obj = c.toObject();
          if (
            req.session.customer_id &&
            obj.customerID == req.session.customer_id
          ) {
            obj.logged = true;
          } else {
            obj.logged = false;
          }
          return obj;
        });

        res.json({
          review: mapped,
          total: Math.ceil(total / page_size),
          currentCustomerID,
        });
      });
  } catch (e) {
    res.status(500).json({ status: "error", message: "something went wrong" });
  }
});

// Update Reviews
router.route("/updateReview/:id").put(async (req, res) => {
  console.log("print");
  const reviewID = req.params.id;
  const {
    review,
    rating,
    image1,
    image2,
    image3,
    fname,
    lname,
    customerID,
    productID,
  } = req.body;
  const updateReview = {
    review,
    rating,
    image1,
    image2,
    image3,
    fname,
    lname,
    customerID,
    productID,
  };

  const update = await Review.findByIdAndUpdate(reviewID, updateReview)
    .then(() => {
      res.status(200).send({ status: "Review Updated" });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send({ status: "error", message: "Error with Updating data" });
    });
});

//Deleting data
router.route("/deleteReviews/:id").delete(async (req, res) => {
  let reviewID = req.params.id;
  await Review.findByIdAndDelete(reviewID)
    .then(() => {
      res.status(200).send({ status: "Review Deleted" });
    })
    .catch((err) => {
      console.log(err.message);
      res
        .status(500)
        .send({ status: "error", message: "Error with deleting data" });
    });
});

// View Admin Review Report
router.get("/getAdminReviews", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "10");
    const hilo = parseInt(req.query.hilo || "-1");
    console.log(limit);
    console.log(hilo);
    let adminReviewDataStage1 = await Review.aggregate([
      {
        $group: {
          _id: {
            pid: "$productID",
            rating: "$rating",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $group: {
          _id: "$_id.pid",
          counts: {
            $push: {
              rating: "$_id.rating",
              count: "$count",
            },
          },
        },
      },
      {
        $sort: {
          counts: hilo,
        },
      },
      {
        $project: {
          oid: {
            $toObjectId: "$_id",
          },
          count: "$counts",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "oid",
          foreignField: "_id",
          as: "namess",
        },
      },
      {
        $limit: limit,
      },
    ]).exec();

    res.json({
      adminReviewDataStage1,
    });
  } catch (e) {
    res.status(500).json({ status: "error", message: "something went wrong" });
  }
});

module.exports = router;
