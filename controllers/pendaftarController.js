const pool = require('../config/db.js')
const multer = require('multer')
const path = require('path')
const fs = require('fs');
const folders = ['uploads/fotodiri', 'uploads/surat', 'uploads/bukti_pembayaran', 'uploads/card'];

folders.forEach(folder => {
    const folderPath = path.join(__dirname, '..', folder); 
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
});


// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Tentukan folder berdasarkan fieldname
        let folder = 'uploads'; // Default folder
        if (file.fieldname === 'fotoDiri') {
            folder = 'uploads/fotodiri';
        } else if (file.fieldname === 'fileSurat') {
            folder = 'uploads/surat';
        } else if (file.fieldname === 'buktiPembayaran') {
            folder = 'uploads/bukti_pembayaran';
        }else if (file.fieldname ==='card'){
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

// Middleware untuk menangani beberapa file
exports.uploadFiles = upload.fields([
    { name: 'fotoDiri', maxCount: 1 },
    { name: 'fileSurat', maxCount: 1 },
    { name: 'buktiPembayaran', maxCount: 1 },
    // { name: 'card', maxCount: 1 } 
]);


exports.kelengkapan = async function (req, res) {
    try {
        const userId = req.body.id; // Pastikan ID user dikirim melalui body
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Ambil file dari req.files
        const fotoDiri = req.files['fotoDiri'] ? req.files['fotoDiri'][0] : null;
        const fileSurat = req.files['fileSurat'] ? req.files['fileSurat'][0] : null;
        const buktiPembayaran = req.files['buktiPembayaran'] ? req.files['buktiPembayaran'][0] : null;

        // Siapkan URL file
        const fotoDiriUrl = fotoDiri ? `/uploads/foto_profil/${fotoDiri.filename}` : null;
        const fileSuratUrl = fileSurat ? `/uploads/surat/${fileSurat.filename}` : null;
        const buktiPembayaranUrl = buktiPembayaran ? `/uploads/bukti_pembayaran/${buktiPembayaran.filename}` : null;

        // Query untuk memperbarui data di tabel users
        const updateQuery = `
            UPDATE pendaftar 
            SET 
                url_foto_diri = ?, 
                url_surat_permohonan = ?, 
                url_bukti_pembayaran = ? 
                status_verifikasi = ?,
            WHERE id = ?;
        `;
        const values = [fotoDiriUrl, fileSuratUrl, buktiPembayaranUrl,"menunggu konfirmasi admin", userId];
        await pool.execute(updateQuery, values);
        res.status(200).json({
            message: 'Files uploaded and URLs saved to database successfully!',
            files: {
                fotoDiri: fotoDiriUrl,
                fileSurat: fileSuratUrl,
                buktiPembayaran: buktiPembayaranUrl,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to upload files and save URLs', error: err });
    }
};



exports.simpan = async function (req, res) {
    // return res.end();
    try {
        const {
            nama_lengkap,
            nik,
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
            email,
            no_telepon,
            profesi,
            profesi_lainnya,
            pekerjaan,
            instansi,
            tahun_berangkat,
            tahun_pulang,
            nama_perusahaan_magang,
            bidang_kerja_magang,
            provinsi,
            kabupaten,
            kecamatan,
            desa,
            rt,
            rw,
            jalan,
            kode_pos,
            nama_usaha,
            bidang_usaha,
            alamat_usaha,
            tahun_berdiri,
            karyawan_usaha,
            nama_perusahaan_bekerja,
            jabatan_bekerja,
            alamat_perusahaan_bekerja
        } = req.body;
        const errors = [];
        if (!nama_lengkap || typeof nama_lengkap !== 'string') errors.push('Nama lengkap harus berupa string dan tidak boleh kosong.');
        if (!nik || !/^[0-9]{16}$/.test(nik)) errors.push('NIK harus berupa 16 digit angka.');
        if (!tempat_lahir || typeof tempat_lahir !== 'string') errors.push('Tempat lahir harus berupa string dan tidak boleh kosong.');
        if (!tanggal_lahir || !/\d{4}-\d{2}-\d{2}/.test(tanggal_lahir)) errors.push('Tanggal lahir harus dalam format YYYY-MM-DD.');
        if (!jenis_kelamin || (jenis_kelamin !== 'laki-laki' && jenis_kelamin !== 'perempuan')) errors.push('Jenis kelamin harus "laki-laki" atau "perempuan".');
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Email harus dalam format yang valid.');
        if (!no_telepon || !/^[0-9]{10,15}$/.test(no_telepon)) errors.push('Nomor telepon harus berupa angka dengan panjang 10-15 karakter.');
        if (!profesi || typeof profesi !== 'string') errors.push('Profesi harus berupa string dan tidak boleh kosong.');
        if (!pekerjaan || typeof pekerjaan !== 's   tring') errors.push('Pekerjaan harus berupa string dan tidak boleh kosong.');
        if (!instansi || typeof instansi !== 'string') errors.push('Instansi harus berupa string dan tidak boleh kosong.');
        if (!provinsi || typeof provinsi !== 'string') errors.push('Provinsi harus berupa string dan tidak boleh kosong.');
        if (!kabupaten || typeof kabupaten !== 'string') errors.push('Kabupaten harus berupa string dan tidak boleh kosong.');
        if (!kecamatan || typeof kecamatan !== 'string') errors.push('Kecamatan harus berupa string dan tidak boleh kosong.');
        if (!desa || typeof desa !== 'string') errors.push('Desa harus berupa string dan tidak boleh kosong.');
        if (!rt || !/^[0-9]+$/.test(rt)) errors.push('RT harus berupa angka.');
        if (!rw || !/^[0-9]+$/.test(rw)) errors.push('RW harus berupa angka.');
        if (!jalan || typeof jalan !== 'string') errors.push('Jalan harus berupa string dan tidak boleh kosong.');
        if (!kode_pos || !/^[0-9]{5}$/.test(kode_pos)) errors.push('Kode pos harus berupa 5 digit angka.');
        if (tahun_berdiri && !/^[0-9]{4}$/.test(tahun_berdiri)) errors.push('Tahun berdiri harus berupa 4 digit angka.');
        if (karyawan_usaha && (typeof karyawan_usaha !== 'number' || karyawan_usaha < 0)) errors.push('Jumlah karyawan usaha harus berupa angka positif.');

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const query = `
        INSERT INTO pendaftar (
        nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, email,
        no_telepon, profesi, profesi_lainnya, pekerjaan, instansi, tahun_berangkat,
        tahun_pulang, nama_perusahaan_magang, bidang_kerja_magang, provinsi,
        kabupaten, kecamatan, desa, rt, rw, jalan, kode_pos, nama_usaha, bidang_usaha, alamat_usaha, tahun_berdiri, karyawan_usaha, nama_perusahaan_bekerja,
        jabatan_bekerja, alamat_perusahaan_bekerja,status_verifikasi) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`

        const value = [
            nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, email,
            no_telepon, profesi, profesi_lainnya, pekerjaan, instansi, tahun_berangkat,
            tahun_pulang, nama_perusahaan_magang, bidang_kerja_magang, provinsi,
            kabupaten, kecamatan, desa, rt, rw, jalan, kode_pos, nama_usaha, bidang_usaha, alamat_usaha, tahun_berdiri, karyawan_usaha, nama_perusahaan_bekerja,
            jabatan_bekerja, alamat_perusahaan_bekerja,"belum di verifikasi"
        ]
        await pool.execute(query, value)
    
        return res.status(200).json({ message: 'Data berhasil disimpan' })
        

    } catch (error) {
        return res.status(500).json({ error: "internal server error" })
    }
}



exports.ambilData = async function (req, res) {
    try{
        const {nik, email}= req.body

        if (nik.toString().trim().length <= 0 || email.toString().trim().length <= 0) {
            console.log('Warning')
            return res.end()
        }

        if (!nik || !email || typeof email !== "string" && typeof nik !== "string" || nik && email === " "){
            console.log("eror validation")
        }

        const query = `SELECT * FROM pendaftar WHERE nik =? AND email =?`
        const values = [nik, email]
        const [rows] = await pool.execute(query, values)
        
        if(rows.length === 0){
            return res.status(404).json({message: "Data tidak ditemukan"})
        }
        return res.status(200).json(rows)

    }catch(err){
        res.end()
    }

}

exports.cardData = async function(req, res){
    const {id} = req.query.id
    try {
        const query =  `SELECT url_card FROM pendaftar WHERE id = '${id}'`
        const [rows] = await pool.execute(query)
        res.status(200).json({
            message: 'card',
            data: rows[0]
        })
    } catch (error) {
        
    }

}