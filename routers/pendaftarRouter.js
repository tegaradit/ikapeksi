const pendaftarController = require('../controllers/pendaftarController')
const express = require('express')

const router = express.Router()

router.post('/daftar', pendaftarController.simpan)

router.post('/cariuser', pendaftarController.ambilData)

router.get('/card' , pendaftarController.cardData)
router.put('/upload', pendaftarController.uploadFiles, pendaftarController.kelengkapan)
module.exports = router