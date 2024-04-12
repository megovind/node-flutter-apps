const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const passport = require("passport");
const multer = require("multer");
const cronJob = require("cron").CronJob;

//website contacts
const contactRoute = require("./api/routes/Contacts");
//dashboard routes
const dashboardRoute = require("./api/routes/Dashboard");
//User routes
const usersRoute = require("./api/routes/Users");
//Truck routes
const trucksRoute = require("./api/routes/Truck");
//Incidents Routes
const incidentRoute = require("./api/routes/Incident");
//Incidents payment Routes
const incidentPayment = require("./api/routes/Payment");
//Utilities Routes
const utilitiesRoute = require("./api/routes/Utilities");
//Document types Route
const documentTypesRoute = require("./api/routes/Documents");
//Service Provider Routes
const serviceProviderRoute = require("./api/routes/ServiceProvider");
//Services Routes
const serviceRoute = require("./api/routes/Services");
//Representative Routes
const representativeRoute = require("./api/routes/representative");
//Mechanic specilizations Routes
const specializationRoute = require("./api/routes/Specialization");
//Representative Expense Routes
// const representativeExpense = require("./api/routes/representative/Expense");
//Incident paymnet Routes
const paymentRoute = require("./api/routes/Payment");
//Subscription RoutesSubscription APIs
const subscriptionRoute = require("./api/routes/Subscription");
//Transporter Routes
const transporterRoute = require("./api/routes/Transporter");
//Driver Routes
const driverRoute = require("./api/routes/Driver");
//Trip Routes
const tripRoutes = require("./api/routes/Trips");

//covid
const covidRoute = require("./api/routes/Covid")

//Third Part
const thirdPartyRoute = require("./api/routes/ThirdPartyAPIs");

const thirdPartyMainRoute = require("./api/routes/ThirdPartyAPIs/mainapi")

//Cron JOBS
const cronsRoute = require("./api/utilities/cron-jobs");


dotenv.config();
mongoose.Promise = global.Promise;

mongoose.set("useCreateIndex", true);
const options = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
};

mongoose.connect(process.env.DB_URL, options).catch((error) => {
  console.log("MongoDB Connection Rejected", error);
});

app.use(morgan("dev"));
app.use("/images", express.static("images"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer().single("file"));
app.use(passport.initialize());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,  Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});
require("./api/middleware/passport")(passport);

// routes which should handle requests
app.get("/", (req, res) => {
  res.sendFile("/index.html", { root: __dirname });
});

//to get contact info from website
app.use("/user-info-from-website", contactRoute);

//To get dashboard statistics data
app.use("/dashboard", dashboardRoute);

//User APIs
app.use("/user", usersRoute);

//Truck APIs
app.use("/trucks", trucksRoute);

//Incidents APIs
app.use("/incidents", incidentRoute);

//Document Types APIs
app.use("/document-types", documentTypesRoute);

//Incident Expense APIs
app.use("/incident-expense", incidentPayment);

//Utilities APIs
app.use("/utility", utilitiesRoute);

//Service Providers APIs
app.use("/service-provider", serviceProviderRoute);

//Services APIs
app.use("/services", serviceRoute);

//Representative APIs
app.use("/representative", representativeRoute);

//Mechanic Specilization APIs
app.use("/specialization", specializationRoute);

//Representative Expense APIs
// app.use("/expense", representativeExpense);

//Incident Payment APIs
app.use("/payment", paymentRoute);

//Subscription APIs
app.use("/subscription", subscriptionRoute);

//Transporter APIs
app.use("/transporter", transporterRoute);

//Driver APIs
app.use("/driver", driverRoute);

//Trips APIs
app.use("/trips", tripRoutes);

//covid
app.use("/covid", covidRoute)

//API for third party
app.use("/referrel-api", thirdPartyRoute)

//Main Third Part API
app.use("/api", thirdPartyMainRoute)

const job = new cronJob("0 10 * * 1-7", cronsRoute.runDocRemindCron);

// const job = new CronJob("0 10 * * * *", function() {
//   const d = new Date();
//   console.log("Every day:", d);
// });
if (process.env.NODE_ENV === "production") {
  job.start();
}

app.use((req, res, next) => {
  const error = new Error("API Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
module.exports = app;
