import express from "express";
const Questions = require("../models/questions");

const router = express.Router();

// Add Questions
router.post("/addQuestion", async (req, res) => {
  try {
    const data = req.body;
    console.dir(data);
    const newTest = new Questions(data);
    await newTest.save();
  } catch (e) {
    res.status(500).json({ status: "error", message: "something went wrong" });
  }
  res.status(200).json({ status: "ok" });
  console.log("works");
});

// View Questions
router.get("/getQuestion", async (req, res) => {
  try {
    Questions.find().then((question) => {
      res.json(question);
    });
  } catch (e) {
    res.status(500).json({ status: "error", message: "something went wrong" });
  }
});

// Update Reviews
// router.route("/updateReview/:id").put(async (req, res) => {
//   console.log("print");
//   const reviewID = req.params.id;
//   const { review, rating, image1, image2, image3 } = req.body;

//   const updateReview = { review, rating, image1, image2, image3 };

//   const update = await Review.findByIdAndUpdate(reviewID, updateReview)
//     .then(() => {
//       res.status(200).send({ status: "Review Updated" });
//     })
//     .catch((err) => {
//       console.log(err);
//       res
//         .status(500)
//         .send({ status: "error", message: "Error with Updating data" });
//     });
// });

//Deleting data
router.route("/deleteQuestion/:id").delete(async (req, res) => {
  let questionID = req.params.id;
  await Questions.findByIdAndDelete(questionID)
    .then(() => {
      res.status(200).send({ status: "Question Deleted" });
    })
    .catch((err) => {
      console.log(err.message);
      res
        .status(500)
        .send({ status: "error", message: "Error with deleting data" });
    });
});

module.exports = router;