import express from "express";
import { customerAuthRequired } from "../middleware/auth";
const Questions = require("../models/questions");
const page_size = 3;
const router = express.Router();

// Add Questions
router.post("/addQuestion", customerAuthRequired, async (req, res) => {
  try {
    const data = req.body;
    data.customer_id = req.session.customer_id;
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
    const page = parseInt(req.query.page || "0");
    const serach = req.query.search || "";
    const total = await Questions.countDocuments({
      question: { $regex: serach, $options: "i" },
    });
    const total2 = total;

    Questions.find({ question: { $regex: serach, $options: "i" } })
      .sort({ _id: "desc" })
      .limit(page_size)
      .skip(page_size * page)
      .then((question) => {
        let mapped = question.map((c) => {
          let obj = c.toObject();
          console.dir(obj);
          console.log("11" + req.session.customer_id);
          console.log("22" + obj.customer_id);
          if (
            req.session.customer_id &&
            obj.customer_id == req.session.customer_id
          ) {
            console.log("11" + req.session.customer_id);
            console.log("22" + obj.customer_id);
            obj.logged = true;
          } else {
            obj.logged = false;
          }
          return obj;
        });

        res.json({
          question: mapped,
          total2,
          total: Math.ceil(total / page_size),
        });
      });
  } catch (e) {
    res.status(500).json({ status: "error", message: "something went wrong" });
  }
});

// Add Answer (Update)
router.route("/addAnswerToQuestion/:id").put(async (req, res) => {
  console.log("add answer part");
  const QuestionID = req.params.id;
  const { question, date, email, answer } = req.body;
  const updateQuestion = { question, date, email, answer };

  const update = await Questions.findByIdAndUpdate(QuestionID, updateQuestion)
    .then(() => {
      res.status(200).send({ status: "Question Updated" });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send({ status: "error", message: "Error with question data" });
    });
});

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
