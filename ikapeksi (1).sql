-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 28 Des 2024 pada 00.45
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ikapeksi`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `anggota`
--

CREATE TABLE `anggota` (
  `id` bigint(20) NOT NULL,
  `nama_lengkap` text NOT NULL,
  `nik` varchar(16) NOT NULL,
  `agama` text NOT NULL,
  `tempat_lahir` text NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `jenis_kelamin` enum('laki-laki','perempuan') NOT NULL,
  `email` varchar(255) NOT NULL,
  `no_telepon` varchar(17) NOT NULL,
  `profesi` text NOT NULL,
  `profesi_lainnya` text DEFAULT NULL,
  `pekerjaan` text NOT NULL,
  `instansi` text NOT NULL,
  `tahun_berangkat` year(4) NOT NULL,
  `tahun_pulang` year(4) NOT NULL,
  `nama_perusahaan_magang` text NOT NULL,
  `bidang_kerja_magang` text NOT NULL,
  `provinsi` text NOT NULL,
  `kabupaten` text NOT NULL,
  `kecamatan` text NOT NULL,
  `desa` text NOT NULL,
  `rt` varchar(5) NOT NULL,
  `rw` varchar(5) NOT NULL,
  `jalan` text NOT NULL,
  `kode_pos` varchar(7) NOT NULL,
  `nama_usaha` text DEFAULT NULL,
  `bidang_usaha` text DEFAULT NULL,
  `alamat_usaha` text DEFAULT NULL,
  `tahun_berdiri` year(4) DEFAULT NULL,
  `nama_perusahaan_bekerja` text DEFAULT NULL,
  `alamat_perusahaan_bekerja` text DEFAULT NULL,
  `jabatan_bekerja` text DEFAULT NULL,
  `karyawan_usaha` text DEFAULT NULL,
  `url_bukti_pembayaran` text DEFAULT NULL,
  `url_foto_diri` text DEFAULT NULL,
  `url_surat_permohonan` text DEFAULT NULL,
  `card_id` bigint(20) NOT NULL,
  `url_card` text NOT NULL,
  `tanggal_masuk` date NOT NULL DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `configid`
--

CREATE TABLE `configid` (
  `id` int(11) NOT NULL,
  `text_area` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pendaftar`
--

CREATE TABLE `pendaftar` (
  `id` bigint(20) NOT NULL,
  `nama_lengkap` text NOT NULL,
  `nik` varchar(16) NOT NULL,
  `agama` text NOT NULL,
  `tempat_lahir` text NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `jenis_kelamin` enum('laki-laki','perempuan') NOT NULL,
  `email` varchar(255) NOT NULL,
  `no_telepon` varchar(17) NOT NULL,
  `profesi` text NOT NULL,
  `profesi_lainnya` text DEFAULT NULL,
  `pekerjaan` text NOT NULL,
  `instansi` text NOT NULL,
  `tahun_berangkat` year(4) NOT NULL,
  `tahun_pulang` year(4) NOT NULL,
  `nama_perusahaan_magang` text NOT NULL,
  `bidang_kerja_magang` text NOT NULL,
  `provinsi` text NOT NULL,
  `kabupaten` text NOT NULL,
  `kecamatan` text NOT NULL,
  `desa` text NOT NULL,
  `rt` varchar(5) NOT NULL,
  `rw` varchar(5) NOT NULL,
  `jalan` text NOT NULL,
  `kode_pos` varchar(7) NOT NULL,
  `nama_usaha` text DEFAULT NULL,
  `bidang_usaha` text DEFAULT NULL,
  `alamat_usaha` text DEFAULT NULL,
  `tahun_berdiri` year(4) DEFAULT NULL,
  `nama_perusahaan_bekerja` text DEFAULT NULL,
  `alamat_perusahaan_bekerja` text DEFAULT NULL,
  `jabatan_bekerja` text DEFAULT NULL,
  `karyawan_usaha` text DEFAULT NULL,
  `url_bukti_pembayaran` text DEFAULT NULL,
  `url_foto_diri` text DEFAULT NULL,
  `url_surat_permohonan` text DEFAULT NULL,
  `url_card` text DEFAULT NULL,
  `status_keanggotaan` text DEFAULT NULL,
  `status_verifikasi` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` text NOT NULL,
  `nama_lengkap` varchar(120) NOT NULL,
  `password` varchar(60) NOT NULL,
  `role` enum('admin','superadmin','','') NOT NULL,
  `refresh_token` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `anggota`
--
ALTER TABLE `anggota`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `card_id` (`card_id`);

--
-- Indeks untuk tabel `configid`
--
ALTER TABLE `configid`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `pendaftar`
--
ALTER TABLE `pendaftar`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `anggota`
--
ALTER TABLE `anggota`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `configid`
--
ALTER TABLE `configid`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pendaftar`
--
ALTER TABLE `pendaftar`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
