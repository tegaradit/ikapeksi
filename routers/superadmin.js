const superadmin = require('../controllers/superadmin')
const express = require('express')
const authMiddleware  = require('../middleware/authmiddleware')
const router = express()

router.put('/textarea', superadmin.textarea, authMiddleware.authMiddleware)

module.exports = router
