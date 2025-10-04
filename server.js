/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const path = require("path")
const app = express()
const static = require("./routes/static")

/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

/* ***********************
 * Routes
 *************************/
app.use(static)

// Inventory routes
const inventoryRoute = require("./routes/inventoryRoute")
app.use("/inv", inventoryRoute)


// Index route
app.get("/", (req, res) => {
  res.render("index", { title: "CSE Motors - Home" })
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
