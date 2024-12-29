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
        const query = `SELECT COUNT(*) AS count FROM anggota`
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
            AND (nama_lengkap LIKE ? OR email LIKE ?)
            LIMIT ? OFFSET ?
        `;
        const searchQuery = `%${search}%`;
        const [rows] = await pool.execute(query, [searchQuery, searchQuery, pageSize, offset]);
        const countQuery = `
            SELECT COUNT(*) as total FROM pendaftar
            WHERE status_verifikasi = 'menunggu konfirmasi admin'
            AND (nama_lengkap LIKE ? OR email LIKE ?)
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
    AND (nama_lengkap LIKE ? OR email LIKE ?)
    LIMIT ? OFFSET ?
`;

        const searchQuery = `%${search}%`;
        const [rows] = await pool.execute(query, [searchQuery, searchQuery, pageSize, offset]);
        const countQuery = `
            SELECT COUNT(*) as total FROM pendaftar
            WHERE status_verifikasi = 'belum di verifikasi'
            AND (nama_lengkap LIKE ? OR email LIKE ?)
        `;
        const [countResult] = await pool.execute(countQuery, [searchQuery, searchQuery]);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / pageSize);
        console.log("Query Parameters:", req.query);
        console.log("Search Query:", `%${search}%`);
        console.log("Pagination:", { page: currentPage, limit: pageSize, offset });

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
    upload.single('card'),
    async function (req, res) {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'ID pendaftar tidak diberikan' });
        }
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'File card tidak diupload' });
            }
            const filePath = `/uploads/card/${req.file.filename}`;
            const [pendaftar] = await pool.execute('SELECT * FROM pendaftar WHERE id = ?', [id]);
            if (pendaftar.length === 0) {
                return res.status(404).json({ message: 'Pendaftar tidak ditemukan' });
            }
            const data = pendaftar[0];
            const regionCodes = {
                'Aceh': '11',
                'Sumatera Utara': '12',
                'Sumatera Barat': '13',
                'Riau': '14',
                'Jambi': '15',
                'Sumatera Selatan': '16',
                'Bengkulu': '17',
                'Lampung': '18',
                'Kepulauan Bangka Belitung': '19',
                'Kepulauan Riau': '21',
                'DKI Jakarta': '31',
                'Jawa Barat': '32',
                'Jawa Tengah': '33',
                'DI Yogyakarta': '34',
                'Jawa Timur': '35',
                'Banten': '36',
                'Bali': '51',
                'Nusa Tenggara Barat': '52',
                'Nusa Tenggara Timur': '53',
                'Kalimantan Barat': '61',
                'Kalimantan Tengah': '62',
                'Kalimantan Selatan': '63',
                'Kalimantan Timur': '64',
                'Kalimantan Utara': '65',
                'Sulawesi Utara': '71',
                'Sulawesi Tengah': '72',
                'Sulawesi Selatan': '73',
                'Sulawesi Tenggara': '74',
                'Gorontalo': '75',
                'Sulawesi Barat': '76',
                'Maluku': '81',
                'Maluku Utara': '82',
                'Papua': '91',
                'Papua Barat': '92'
            };
            const regionCode = regionCodes[data.provinsi];
            if (!regionCode) {
                return res.status(404).json({ message: `Kode wilayah tidak ditemukan untuk provinsi: ${data.provinsi}` });
            }
            const yearCode = new Date().getFullYear().toString().slice(-2);
            const [lastCard] = await pool.execute(
                "SELECT MAX(card_id) AS lastCardId FROM anggota WHERE card_id LIKE ?",
                [`${regionCode}${yearCode}%`]
            );
            const lastIncrement = lastCard[0].lastCardId
                ? parseInt(lastCard[0].lastCardId.toString().slice(-4))
                : 0;
            const increment = (lastIncrement + 1).toString().padStart(4, '0');
            const cardId = `${regionCode}${yearCode}${increment}`;
            await pool.execute(
                `INSERT INTO anggota (nama_lengkap, nik, agama, tempat_lahir, tanggal_lahir, jenis_kelamin, email, no_telepon, profesi, profesi_lainnya, pekerjaan, instansi, tahun_berangkat, tahun_pulang, nama_perusahaan_magang, bidang_kerja_magang, provinsi, kabupaten, kecamatan, desa, rt, rw, jalan, kode_pos, nama_usaha, bidang_usaha, alamat_usaha, tahun_berdiri, nama_perusahaan_bekerja, alamat_perusahaan_bekerja, jabatan_bekerja, karyawan_usaha, url_bukti_pembayaran, url_foto_diri, url_surat_permohonan, card_id, url_card, tanggal_masuk) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)`,
                [
                    data.nama_lengkap,
                    data.nik,
                    data.agama,
                    data.tempat_lahir,
                    data.tanggal_lahir,
                    data.jenis_kelamin,
                    data.email,
                    data.no_telepon,
                    data.profesi,
                    data.profesi_lainnya,
                    data.pekerjaan,
                    data.instansi,
                    data.tahun_berangkat,
                    data.tahun_pulang,
                    data.nama_perusahaan_magang,
                    data.bidang_kerja_magang,
                    data.provinsi,
                    data.kabupaten,
                    data.kecamatan,
                    data.desa,
                    data.rt,
                    data.rw,
                    data.jalan,
                    data.kode_pos,
                    data.nama_usaha,
                    data.bidang_usaha,
                    data.alamat_usaha,
                    data.tahun_berdiri,
                    data.nama_perusahaan_bekerja,
                    data.alamat_perusahaan_bekerja,
                    data.jabatan_bekerja,
                    data.karyawan_usaha,
                    data.url_bukti_pembayaran,
                    data.url_foto_diri,
                    data.url_surat_permohonan,
                    cardId,
                    filePath
                ]
            );
            await pool.execute('DELETE FROM pendaftar WHERE id = ?', [id]);
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PW_EMAIL,
                },
            });
            await transporter.sendMail({
                from: '"IKAPEKSI" <ikapeksi@gmail.com>',
                to: data.email,
                subject: 'Verifikasi Pendaftaran Anda',
                text: `Halo ${data.nama_lengkap}, pendaftaran Anda telah diverifikasi dan Anda kini menjadi anggota. Nomor kartu Anda: ${cardId}. Terima kasih sudah mendaftar.`,
            });
            res.status(200).json({ message: 'Pendaftar berhasil dipindahkan ke anggota, email dikirim, dan file tersimpan', cardId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error saat memproses verifikasi', error: error.message });
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
            AND (nama_lengkap LIKE ? OR email LIKE ?)
            LIMIT ? OFFSET ?
        `;
        const searchQuery = `%${search}%`;
        const [rows] = await pool.execute(query, [searchQuery, searchQuery, pageSize, offset]);
        const countQuery = `
            SELECT COUNT(*) as total FROM pendaftar
            WHERE status_verifikasi = 'anggota'
            AND (nama_lengkap LIKE ? OR email LIKE ?)
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

exports.dataAnggotaPerbulan = (req, res) => {
    const query = `
      SELECT YEAR(tanggal_masuk) AS tahun, MONTH(tanggal_masuk) AS bulan, COUNT(*) AS jumlah_anggota
      FROM anggota
      GROUP BY YEAR(tanggal_masuk), MONTH(tanggal_masuk)
      ORDER BY tahun DESC, bulan DESC;
    `;
    db.execute(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
        }
        return res.json({
            data: results,
        });
    });
};
