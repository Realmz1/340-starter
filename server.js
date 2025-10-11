/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const utilities = require("./utilities")
const env = require("dotenv").config()
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
const cookieParser = require("cookie-parser")
const app = express()

// Session & Flash setup
app.use(
  session({
    secret: "superSecretSessionKey", // can be any random string
    resave: false,
    saveUninitialized: true,
  })
)
app.use(flash())

// Cookie parser middleware
app.use(cookieParser())

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static route
const static = require("./routes/static")

/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

/* ***********************
 * Static assets
 *************************/
app.use(express.static(path.join(__dirname, "public")))

/* ***********************
 * Routes
 *************************/
app.use(static)

// JWT Token Check and Make Data Available to All Views
app.use(function (req, res, next) {
  if (req.cookies.jwt) {
    const jwt = require("jsonwebtoken")
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (!err) {
          res.locals.accountData = accountData
          res.locals.loggedin = 1
        }
      }
    )
  }
  next()
})

// Account routes
const accountRoute = require("./routes/accountRoute")
app.use("/account", accountRoute)

// Inventory routes
const inventoryRoute = require("./routes/inventoryRoute")
app.use("/inv", inventoryRoute)

// Review routes
const reviewRoute = require("./routes/reviewRoute")
app.use("/review", reviewRoute)


// Index route
app.get("/", async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.render("index", {
      title: "CSE Motors - Home",
      nav
    })
  } catch (err) {
    next(err)
  }
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

// 404 handler
app.use((req, res, next) => {
  res.status(404).render("errors/error", {
    title: "404 Not Found",
    message: "The page you requested could not be found.",
    nav: utilities.getNav()
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render("errors/error", {
    title: "Server Error",
    message: "Something went wrong. Please try again later.",
    nav: utilities.getNav()
  })
})
