Tentu, ini adalah rancangan *Product Requirements Document* (PRD) yang disusun secara formal dan terstruktur untuk memfasilitasi kebutuhan pelaporan di area *Melting - Pouring & Analysis*.

---

## Product Requirements Document (PRD)

**Nama Produk:** Sistem Pelaporan Henkaten & Problem Produksi
**Area/Departemen:** Melting - Pouring & Analysis

---

### 1. Tujuan Produk

Sistem web ini bertujuan untuk mendigitalkan dan menstandarisasi proses pelaporan masalah, temuan, atau *henkaten* (perubahan) di *line* produksi. Sistem ini dirancang untuk mempercepat alur informasi dari operator produksi kepada tim terkait (PIC) dan memberikan kontrol penuh kepada Leader untuk meninjau status perbaikan secara terpusat dan aman.

### 2. Aktor & Hak Akses Pengguna (User Roles)

Sistem ini akan memiliki dua jenis pengguna dengan tingkat akses yang berbeda:

* **Pelapor (Operator/Staff):** Pengguna umum yang dapat mengakses halaman form tanpa perlu *login*. Pengguna ini hanya memiliki hak untuk mengisi dan mengirimkan (*submit*) data.
* **Leader (Admin/Viewer):** Pengguna dengan otoritas khusus yang wajib melakukan otentikasi (*login* menggunakan *username* dan *password*). Leader memiliki hak untuk melihat rekapitulasi data, mengunduh laporan, dan memantau status penyelesaian.

---

### 3. Spesifikasi Form Input (Halaman Pelapor)

Halaman utama berupa form dengan kolom input wajib (Mandatory) untuk memastikan kelengkapan data.

| Nama Kolom | Jenis Input (Tipe Data) | Keterangan / Pilihan |
| --- | --- | --- |
| **Name** | *Text Input* | Nama lengkap pelapor. |
| **No. Reg** | *Text / Number Input* | Nomor registrasi atau ID karyawan. |
| **Shift** | *Dropdown* | Pilihan: `Red`, `White`. |
| **Date** | *Date Picker* | Tanggal terjadinya temuan/masalah. |
| **Time** | *Time Picker* | Jam dan menit (Format: HH:MM). |
| **Location** | *Text Input* | Pengisian manual lokasi spesifik di area *Melting/Pouring/Analysis*. |
| **Factor (4M)** | *Dropdown* | Pilihan: `Man`, `Methode`, `Machine`, `Material`. |
| **Henkaten/Problem/Temuan** | *Text Area* | Deskripsi detail mengenai masalah atau perubahan yang ditemukan. |
| **Tujuan/Dampak** | *Text Area* | Penjelasan mengenai konsekuensi dari masalah (misal: *downtime*, cacat produk). |
| **Foto Before** | *File Upload* | Unggah gambar (.jpg, .png) kondisi sebelum perbaikan/saat masalah terjadi. |
| **Foto After** | *File Upload* | Unggah gambar (.jpg, .png) kondisi setelah *countermeasure* (opsional jika belum ada). |
| **Countermeasure / Saran** | *Text Area* | Tindakan perbaikan yang dilakukan atau disarankan. |
| **PIC** | *Dropdown* | Pilihan: `Maintenance`, `Engineering`, `Kaizen`, `Production`. |
| **Status** | *Dropdown / Radio Button* | Pilihan: `Temporary Action`, `Fix Action`. |
| **Finish Date** | *Date Picker* | Tanggal penyelesaian tindakan perbaikan. |
| **Finish Time** | *Time Picker* | Jam dan menit penyelesaian tindakan. |

---

### 4. Spesifikasi Sistem Dashboard (Halaman Leader)

Bagian ini khusus diakses oleh Leader setelah berhasil melewati proses otentikasi keamanan.

* **Halaman Login:** Membutuhkan kredensial berupa ID/Email dan *Password*.
* **Tabel Data (*Data Grid*):** Menampilkan seluruh data hasil *submit* dari form produksi secara kronologis.
* **Filter & Pencarian:** Fitur untuk menyaring data berdasarkan rentang tanggal (*Date*), *Shift*, *Status* penyelesaian, atau *PIC*.
* **Galeri Foto:** Fitur untuk melihat perbandingan "Foto Before" dan "Foto After" langsung dari tabel dengan mengklik pratinjau gambar.

### 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

* **Responsivitas:** Tampilan web harus responsif dan mudah diakses melalui perangkat *mobile* (tablet/HP yang digunakan di area produksi) maupun *desktop* (komputer Leader).
* **Keamanan:** Akses *dashboard* wajib dilindungi dengan enkripsi *password* dasar.
* **Kinerja:** Proses unggah foto harus dikompresi secara otomatis agar tidak membebani server dan mempercepat waktu *loading*.

---
 Rekomendasi Metrik Dashboard (Untuk Halaman Leader) 

Nama Visualisasi,Jenis Grafik,Tujuan Informasi
Total Henkaten Aktif,Scorecard / Angka Besar,Menampilkan jumlah total laporan baru hari ini atau minggu ini secara sekilas.
Komposisi Faktor 4M,Pie Chart / Donut Chart,"Membandingkan persentase penyebab masalah (Man, Methode, Machine, Material) untuk fokus perbaikan."
Status Penyelesaian,Bar Chart / Grafik Batang,Membandingkan jumlah laporan dengan status Temporary Action versus Fix Action.
Distribusi per PIC,Bar Chart / Grafik Batang,Menunjukkan beban penyelesaian masalah pada masing-masing departemen pendukung.

Berikut adalah rekomendasi tech stack yang sangat ideal dan tangguh untuk arsitektur aplikasi ini:

1. Front-End (Antarmuka Pengguna)
Framework: Next.js (berbasis React).

Alasan: Sangat optimal untuk membangun aplikasi web yang cepat dan interaktif. Next.js menyediakan sistem routing yang sangat baik untuk memisahkan halaman form publik (Operator) dan dashboard rahasia (Leader).

Styling: Tailwind CSS.

Alasan: Memungkinkan pembuatan desain yang sangat responsif dengan cepat. Ini krusial karena form akan diakses dari perangkat genggam atau tablet di area produksi, sementara dashboard diakses dari layar komputer/laptop.

2. Back-End & API
Environment: Node.js.

Alasan: Mampu menangani banyak request secara bersamaan (sangat berguna jika terjadi pergantian shift dan banyak operator submit form secara paralel). Anda bisa memanfaatkan fitur API Routes bawaan dari Next.js untuk menyederhanakan arsitektur, atau menggunakan Express.js jika ingin server yang terpisah.

3. Database (Penyimpanan Data)
Relational Database: PostgreSQL.

Alasan: Data pelaporan henkaten sangat terstruktur (memiliki relasi yang jelas antara waktu, shift, lokasi, dan status). PostgreSQL sangat handal untuk kueri yang kompleks, terutama saat dashboard perlu melakukan filtering data laporan berdasarkan rentang tanggal, faktor 4M, atau PIC.

4. Penyimpanan Berkas (File Storage)
Karena aplikasi mewajibkan fitur unggah "Foto Before" dan "Foto After", menyimpan gambar langsung di dalam database tidak disarankan karena akan memperlambat kinerja.

Cloud Storage: Amazon S3, Cloudinary, atau Supabase Storage.

Alasan: Didesain khusus untuk menyimpan aset gambar dengan efisien dan dapat memproses kompresi otomatis agar loading halaman tetap cepat.