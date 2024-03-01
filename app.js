const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
// loads environment variables from a .env file into process.env
require("dotenv").config();
const mongoose = require("mongoose");

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
mongoose.set("strictQuery", false);
// Define the database URL to connect to.
const mongoDB = process.env.MONGODB_URI;
// Wait for database to connect, logging an error if there is a problem
async function main() {
  await mongoose.connect(mongoDB);
}

main().catch((err) => console.log(err));

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const inventoryRouter = require("./routes/inventory"); //Import routes for "inventory" area of site

const compression = require("compression");
const helmet = require("helmet");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // Compress all routes
// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/inventory", inventoryRouter); // Add inventory routes to middleware chain.

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
