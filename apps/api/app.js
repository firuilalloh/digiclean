require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const errorHandler = require("./middlewares/error.middleware");
const apiRouter = require("./routes/v1");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1", apiRouter);

app.use((req, res, next) => {
  const ApiError = require("./utils/ApiError");
  next(new ApiError(404, `Route ${req.originalUrl} Not Found`));
});

app.use(errorHandler);

module.exports = app;
