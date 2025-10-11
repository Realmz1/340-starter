function throwError(req, res, next) {
  next(new Error("Intentional server error triggered"))
}

module.exports = { throwError }
