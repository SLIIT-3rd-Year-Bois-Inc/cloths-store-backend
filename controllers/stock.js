import express, { Request, response, Response } from "express";
let Product = require("../models/Product");
let Reviews = require("../models/reviews");
const Questions = require("../models/questions");
import { adminAuthRequired } from "../middleware/auth";

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getProductsForCustomer(req, res) {
  let sortingOption = req.query.sortingOption;
  let findObj = JSON.parse(req.query.tempSearchObj);
  console.log(findObj);
  if (req.query.gender) {
    findObj["gernder"] = req.query.gender;
  }

  Product.find(findObj)
    .sort({ price: sortingOption })
    .then((product) => {
      res.json(product);
      console.log(product);
    })
    .catch((err) => {
      console.log(err);
    });
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getProductsForAdmin(req, res) {
  let sortingOption = req.query.sortingOption;
  let findObj = JSON.parse(req.query.tempSearchObj);
  Product.find(findObj)
    .sort({ price: sortingOption })
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      console.log(err);
    });
}
function getProduct(req, res) {
  let id = req.query.id;

  Product.findById(id)
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      console.log(err);
    });
}

function addNewProduct(req, res) {
  console.log(req.body);
  const name = req.body.name;
  const price = Number(req.body.price);
  const gender = req.body.gender;
  const tags = req.body.tags;
  const imagesUrls = req.body.imagesUrls;
  const description = req.body.description;
  const color = req.body.color;
  const quantity = req.body.quantity;

  const newProduct = new Product({
    name,
    price,
    gender,
    tags,
    imagesUrls,
    description,
    color,
    quantity,
  });

  console.log(newProduct);

  newProduct
    .save()
    .then(() => {
      res.json("product added");
    })
    .catch((err) => {
      console.log(err);
    });
}

async function updateProduct(req, res) {
  const {
    _id,
    name,
    price,
    gender,
    tags,
    imagesUrls,
    description,
    color,
    quantity,
  } = req.body;

  const updateProduct = {
    name,
    price,
    gender,
    tags,
    imagesUrls,
    description,
    color,
    quantity,
  };

  const update = await Product.findByIdAndUpdate(_id, updateProduct)
    .then((Response) => {
      res.status(200).send({ status: "product updated", updatedobj: Response });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send({ status: "Error with updating data", error: err.message });
    });
}
async function archiveProduct(req, res) {
  const { _id, archived } = req.body;
  console.log(req.body);
  const updateProduct = {
    archived,
  };
  const update = await Product.findByIdAndUpdate(_id, updateProduct)
    .then((Response) => {
      res.status(200).send({ status: "product updated", updatedobj: Response });
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send({ status: "Error with updating data", error: err.message });
    });
}

//delete product.........................................................................

function deleteProduct(req, res) {
  const { _id } = req.body;
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _id);
  Product.findByIdAndDelete(_id)
    .then((products) => {
      Reviews.deleteMany({ productID: _id })
        .then((reviews) => {
          Questions.deleteMany({ product_id: _id })
            .then((questions) => {
              res
                .status(200)
                .send({
                  status: "Product Deleted",
                  deleted: [products, reviews, questions],
                });
            })
            .catch(() => {
              res.status(500).send({
                status: "error",
                message:
                  "Product deleted! Something went wrong when deleting Qestions!",
              });
            });
        })
        .catch((err) => {
          res.status(500).send({
            status: "error",
            message:
              "Product deleted! Something went wrong when deleting Reviews!",
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        status: "error",
        message: "Product deleted! Something went wrong when deleting Product!",
      });
    });
}

async function searchItemsByName(req, res) {
  const searchValue = req.query.searchValue;
  let findObj = JSON.parse(req.query.tempSearchObj);
  let items;
  if (searchValue) {
    // If search exists, the user typed in the search bar
    items = await Product.aggregate([
      {
        $search: {
          index: "default",
          autocomplete: {
            query: searchValue, // noticed we assign a dynamic value to "query"
            path: "name",
          },
        },
      },
      {
        $match: findObj,
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          gender: 1,
          tags: 1,
          imagesUrls: 1,
          description: 1,
          color: 1,
          quantity: 1,
          archived: 1,
        },
      },
    ]);
  } else {
    // The search is empty so the value of "search" is undefined
    items = await Product.find();
  }

  return res.status(200).json({
    statusCode: 200,
    message: "Fetched posts",
    data: { items },
  });
}

function getGenderCounts(req, res) {
  Product.aggregate([
    {
      $group: {
        _id: "$gender",
        count: { $sum: 1 }, // this means that the count will increment by 1
      },
    },
  ])
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
    });
}

function getTypeCounts(req, res) {
  let findObj = JSON.parse(req.query.tempSearchObj);
  Product.aggregate([
    {
      $match: findObj,
    },
    {
      $unwind: "$tags",
    },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 }, // this means that the count will increment by 1
      },
    },
  ])
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
    });
}

//get min max values
async function getMinMaxValues(req, res) {
  let maxPrice = await Product.find({})
    .select("price")
    .sort({ price: -1 })
    .limit(1);
  let minPrice = await Product.find({})
    .select("price")
    .sort({ price: 1 })
    .limit(1);

  res.json({ minPrice: minPrice[0].price, maxPrice: maxPrice[0].price });
}

export function stockRouter() {
  const router = express.Router();

  router.get("/getCusProducts", getProductsForCustomer);
  router.get("/getAdminProducts", getProductsForAdmin);
  router.get("/getProduct", getProduct);
  router.get("/searchProduct", searchItemsByName);
  router.post("/newProduct", adminAuthRequired, addNewProduct);
  router.post("/deleteProduct", adminAuthRequired, deleteProduct);
  router.put("/archiveProduct", adminAuthRequired, archiveProduct);
  router.put("/updateProduct", adminAuthRequired, updateProduct);
  //report
  router.get("/getGenderCount", getGenderCounts);
  router.get("/getTypeCounts", getTypeCounts);
  router.get("/getMinMaxPrices", getMinMaxValues);

  return router;
}
