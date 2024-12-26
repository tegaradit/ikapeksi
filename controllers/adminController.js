const pool = require('../config/db');
require('dotenv').config();
const multer = require('multer')
const path = require('path')
const nodemailer = require('nodemailer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Tentukan folder berdasarkan fieldname
        let folder = 'uploads'; // Default folder;
        if (file.fieldname === 'card') {
            folder = 'uploads/card';
        }
        // Path absolut
        cb(null, path.join(__dirname, '..', folder));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({ storage });



exports.jumlahBanyakPendaftar = async function (req, res) {
    try {
        const query = `SELECT COUNT(*) AS count FROM pendaftar WHERE status_verifikasi = 'belum di verifikasi'`;
        const [rows] = await pool.execute(query);
        const count = rows[0].count;
        res.status(200).json({
            message: 'jumlah pendaftar / "belum diverifikasi"',
            count: count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error counting data', error: err });
    }
}

exports.jumlahPerluDiverikasi = async function (req, res) {
    try {
        const query = `SELECT COUNT(*) AS count FROM pendaftar WHERE status_verifikasi = 'menunggu konfirmasi admin'`
        const [rows] = await pool.execute(query);
        const count = rows[0].count;
        res.status(200).json({
            message: 'jumlah perlu di verifikasi admin / "menunggu konfirmasi admin"',
            count: count
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error counting data', error: error });
    }
}
exports.jumlahAnggota = async function (req, res) {
    try {
        const query = `SELECT COUNT(*) AS count FROM pendaftar WHERE status ="anggota"`
        const [rows] = await pool.execute(query);
        const count = rows[0].count;
        res.status(200).json({
            message: 'jumlah anggota / "anggota"',
            count: count
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error counting data', error: error });
    }
}
exports.dataPerluVerifikasi = async function (req, res) {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const currentPage = Math.max(parseInt(page, 10), 1);
        const pageSize = Math.max(parseInt(limit, 10), 1);
        const offset = (currentPage - 1) * pageSize;
        const query = `
            SELECT * FROM pendaftar
            WHERE status_verifikasi = 'menunggu konfirmasi admin'
            AND (nama LIKE ? OR email LIKE ?)
            LIMIT ? OFFSET ?
        `;
        const searchQuery = `%${search}%`;
        const [rows] = await pool.execute(query, [searchQuery, searchQuery, pageSize, offset]);
        const countQuery = `
            SELECT COUNT(*) as total FROM pendaftar
            WHERE status_verifikasi = 'menunggu konfirmasi admin'
            AND (nama LIKE ? OR email LIKE ?)
        `;
        const [countResult] = await pool.execute(countQuery, [searchQuery, searchQuery]);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / pageSize);
        res.status(200).json({
            message: 'Data pendaftar yang perlu diverifikasi admin',
            data: rows,
            pagination: {
                currentPage,
                pageSize,
                totalItems,
                totalPages,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching data', error: error });
    }
};


exports.dataBanyakPendaftar = async function (req, res) {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const currentPage = Math.max(parseInt(page, 10), 1);
        const pageSize = Math.max(parseInt(limit, 10), 1);
        const offset = (currentPage - 1) * pageSize;
        const query = `
            SELECT * FROM pendaftar
            WHERE status_verifikasi = 'belum di verifikasi'
            AND (nama LIKE ? OR email LIKE ?)
            LIMIT ? OFFSET ?
        `;
        const searchQuery = `%${search}%`;
        const [rows] = await pool.execute(query, [searchQuery, searchQuery, pageSize, offset]);
        const countQuery = `
            SELECT COUNT(*) as total FROM pendaftar
            WHERE status_verifikasi = 'belum di verifikasi'
            AND (nama LIKE ? OR email LIKE ?)
        `;
        const [countResult] = await pool.execute(countQuery, [searchQuery, searchQuery]);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / pageSize);
        res.status(200).json({
            message: 'Data pendaftar yang belum diverifikasi',
            data: rows,
            pagination: {
                currentPage,
                pageSize,
                totalItems,
                totalPages,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching data', error: error });
    }
};


exports.verifikasiPendaftar = [
    upload.single('card'), // Middleware untuk upload file
    async function (req, res) {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'ID pendaftar tidak diberikan' });
        }

        try {
            // Cek apakah file diupload
            if (!req.file) {
                return res.status(400).json({ message: 'File card tidak diupload' });
            }

            const filePath = `/uploads/card/${req.file.filename}`; // Path untuk disimpan di database
            const [rows] = await pool.execute('SELECT email FROM pendaftar WHERE id = ?', [id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Pendaftar tidak ditemukan' });
            }

            const { email } = rows[0];

            // Kirim email verifikasi
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PW_EMAIL,
                },
            });

            await transporter.sendMail({
                from: '"IKAPEKSI" <ikapeksi@gmail.com>',
                to: email,
                subject: 'Verifikasi Pendaftaran Anda',
                text: `Halo, pendaftaran Anda telah diverifikasi. Terima kasih sudah mendaftar.`,
            });

            // Update status verifikasi dan simpan path file ke database
            await pool.execute(
                'UPDATE pendaftar SET status_verifikasi = ?, url_card = ? WHERE id = ?',
                ['disetujui', filePath, id]
            );

            res.status(200).json({ message: 'Pendaftar berhasil diverifikasi, email dikirim, dan file tersimpan' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error saat verifikasi pendaftar', error: error.message });
        }
    }
];

exports.tolakVerifikasi = async function (req, res) {
    try {
        const id = req.body
        const query = `DELETE FROM pendaftar WHERE id =?`;
        await pool.execute(query, [id]);
        res.status(200).json({ message: 'Pendaftar berhasil ditolak' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error tolak verifikasi pendaftar', error: error });
    }
}
exports.dataanggota = async function (req, res) {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const currentPage = Math.max(parseInt(page, 10), 1);
        const pageSize = Math.max(parseInt(limit, 10), 1);
        const offset = (currentPage - 1) * pageSize;
        const query = `
            SELECT * FROM pendaftar
            WHERE status_verifikasi = 'anggota'
            AND (nama LIKE ? OR email LIKE ?)
            LIMIT ? OFFSET ?
        `;
        const searchQuery = `%${search}%`;
        const [rows] = await pool.execute(query, [searchQuery, searchQuery, pageSize, offset]);
        const countQuery = `
            SELECT COUNT(*) as total FROM pendaftar
            WHERE status_verifikasi = 'anggota'
            AND (nama LIKE ? OR email LIKE ?)
        `;
        const [countResult] = await pool.execute(countQuery, [searchQuery, searchQuery]);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / pageSize);
        res.status(200).json({
            message: 'Data pendaftar yang belum diverifikasi',
            data: rows,
            pagination: {
                currentPage,
                pageSize,
                totalItems,
                totalPages,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching data', error: error });
    }
}
