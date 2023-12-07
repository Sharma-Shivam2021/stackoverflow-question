const mongoUrl =
  "mongodb+srv://nodeServer:nodeServer@cluster0.d0kkvbs.mongodb.net/messageApp?retryWrites=true&w=majority";
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { createHandler } = require("graphql-http/lib/use/express");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
// const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "SuperLongSecretKeyWithMultipleCharacters";

const app = express();

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + ".jpg");
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  console.log("Auth middleware executed");
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  console.log(authHeader);
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
});

app.use(
  "/graphql",
  createHandler({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An errror Occured";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(mongoUrl)
  .then((result) => {
    app.listen(8080, console.log("Servers listening on port 8080"));
  })
  .catch((err) => console.log(err));
