import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ClothsNeedsScheema = new Schema(
  {
    color: [
      {
        type: String,
      },
    ],
    childTags: [
      {
        type: String,
      },
    ],
    mensTags: [
      {
        type: String,
      },
    ],
    unisexTags: [
      {
        type: String,
      },
    ],
    womenTags: [
      {
        type: String,
      },
    ],
  },
  { collection: "clothsNeeds" }
);

const ClothsNeeds = mongoose.model("ClothsNeeds", ClothsNeedsScheema);

module.exports = ClothsNeeds;
