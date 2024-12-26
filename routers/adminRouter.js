const adminController = require('../controllers/adminController')
const express = require('express')
const authMiddleware = require('../middleware/authmiddleware')

const router = express.Router()

router.get('/jumlahPendaftar', adminController.jumlahBanyakPendaftar,authMiddleware.authMiddleware)
router.get('/verifikasi', adminController.jumlahPerluDiverikasi, authMiddleware.authMiddleware)
router.get('/angota', adminController.jumlahAnggota, authMiddleware.authMiddleware)
router.get('/datapendaftar', adminController.dataBanyakPendaftar,authMiddleware.authMiddleware)
router.get('/dataverifikasi', adminController.dataPerluVerifikasi, authMiddleware.authMiddleware)
router.get('/dataanggota', adminController.dataanggota, authMiddleware.authMiddleware)
router.post('/verifikasidata', adminController.verifikasiPendaftar, authMiddleware.authMiddleware)
router.post('/tolakverifikasi', adminController.tolakVerifikasi, authMiddleware.authMiddleware)


module.exports = router