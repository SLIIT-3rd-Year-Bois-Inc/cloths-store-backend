import express, { Request, response, Response } from "express";
let Product = require("../models/Product");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getProductsForCustomer(req, res) {
  let sortingOption = req.query.sortingOption;

  Product.find({ archived: false })
    .sort({ price: sortingOption })
    .select("_id")
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
  Product.find()
    .sort({ price: sortingOption })
    .select("_id")
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
function archiveProduct(req, res) {}
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

function deleteProduct(req, res) {}

export function stockRouter() {
  const router = express.Router();

  router.get("/getCusProducts", getProductsForCustomer);
  router.get("/getAdminProducts", getProductsForAdmin);
  router.get("/getProduct", getProduct);
  router.post("/newProduct", addNewProduct);
  router.delete("/deleteProduct", deleteProduct);
  router.put("/archiveProduct", archiveProduct);
  router.put("/updateProduct", updateProduct);

  return router;
}
