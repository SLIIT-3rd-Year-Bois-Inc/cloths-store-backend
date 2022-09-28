import express from "express";
import reviews from "../models/reviews";
// import { Customer } from "../models/customer";
import { customerAuthRequired } from "../middleware/auth";
import { Customer } from "../models/customer";
const Review = require("../models/reviews");
const page_size = 3;
const router = express.Router();

// Add review
router.post("/addReview", customerAuthRequired, async (req, res) => {
  try {
    let data = req.body;
    console.dir(req.session.customer_id);
    data.customerID = req.session.customer_id;
    console.dir(data);

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
  console.log("works");
});

// View Reviews
router.get("/getReviews", async (req, res) => {
  try {
    const page = parseInt(req.query.page || "0");
    const serach = req.query.search || "";
    let rating = req.query.rating || "";
    let pid = req.query.pid || "";
    const total = await Review.countDocuments({
      review: { $regex: serach, $options: "i" },
      rating: { $regex: rating },
      productID: { $regex: pid },
    });
    const total2 = total;

    Review.find({
      review: { $regex: serach, $options: "i" },
      rating: { $regex: rating },
      productID: { $regex: pid },
    })
      .limit(page_size)
      .skip(page_size * page)
      .then((review) => {
        res.json({
          review,
          total2,
          total: Math.ceil(total / page_size),
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
  const { review, rating, image1, image2, image3 } = req.body;

  const updateReview = { review, rating, image1, image2, image3 };

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

module.exports = router;
