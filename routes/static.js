const express = require('express');
const path = require('path');
const router = express.Router();

// Static Routes
// Serve the entire /public directory and its subfolders
router.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = router;
