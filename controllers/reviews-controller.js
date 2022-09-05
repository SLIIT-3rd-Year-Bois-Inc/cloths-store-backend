import express from "express";
import reviews from "../models/reviews";
// import { Customer } from "../models/customer";
const Review = require("../models/reviews");

const router = express.Router();

// const Storage = multer.diskStorage({})

// Add review
router.post("/addReview", async (req, res) => {
  try {
    const data = req.body;
    console.dir(data);
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
    Review.find().then((review) => {
      res.json(review);
    });
  } catch (e) {
    res.status(500).json({ status: "error", message: "something went wrong" });
  }
});

// Update Reviews
router.route("/updateReview/:id").put(async (req, res) => {
  console.log("print");
  const reviewID = req.params.id;
  const { review, rating } = req.body;

  const updateReview = { review, rating };

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

module.exports = router;
