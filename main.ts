import express from "express";
import mongoose from "mongoose";
import { customerRouter } from "./controllers/customer";
import { stockRouter } from "./controllers/stock";

import { logger, loggerMiddleware } from "./logger";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";

async function main() {
  const app = express();
  const port = process.env.PORT || 4200;
  const mongo_uri = process.env.MONGO_URI || "";

  // Connect to Database
  await mongoose.connect(mongo_uri);

  // Allow API from all origins
  app.use(cors());

  // Attach middleware
  app.use(loggerMiddleware);
  app.use(bodyParser.json({ limit: "2mb" }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "",
      resave: false,
      saveUninitialized: false,
    })
  );

  // Attach routers
  app.use("/api/customer", customerRouter());
  app.use("/api/stock", stockRouter());

  app.get("/", (_, res) =>
    res.send("Hello! This is the Cloths Store Backend.")
  );

  app.listen(port, () => {
    logger.info(`API is ready to 🚀. 👂 on ${port}`);
  });
}

main();
