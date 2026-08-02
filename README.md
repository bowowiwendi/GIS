# GIS Desa

Aplikasi pemetaan rumah penduduk berbasis web menggunakan **Google Apps Script** (backend) dan **Leaflet.js** (frontend) dengan data tersimpan di **Google Sheets**.

## Struktur Proyek
- `/gs/Code.gs`: Backend Google Apps Script untuk operasi Spreadsheet.
- `/web/index.html`: Antarmuka peta interaktif, form input, dan fungsi simpan data.

## Cara Deploy
1. Buka [Google Sheets](https://docs.google.com/spreadsheets/d/1riqVNsmz_tOB9uyZFI1GmT4qV96ZMyJowHyYKnJ44HA/edit).
2. Klik **Extensions > Apps Script**.
3. Salin isi `gs/Code.gs` ke file `Code.gs` di editor.
4. Buat file HTML baru dengan nama `index`, salin isi `web/index.html` ke dalamnya.
5. Klik **Deploy > New deployment > Web app**.
6. Set **Execute as: Me**, **Who has access: Anyone**.
7. Klik **Deploy**.

## Fitur
- Peta OpenStreetMap interaktif dengan Leaflet.js.
- Gambar poligon untuk mengukur luas bangunan (Leaflet.draw).
- Form lengkap dengan validasi (No. bangunan, nama, alamat, RT/RW, jenis bangunan, jumlah keluarga).
- Simpan, edit, dan hapus data penghuni & luas secara *real-time* ke Spreadsheet.
- Tampilan semua bangunan di peta sebagai poligon berwarna sesuai jenis bangunan.
- Dashboard statistik: jumlah bangunan, total & rata-rata luas, jumlah keluarga, dan grafik sebaran jenis bangunan.
- Pencarian teks (nama/alamat/no bangunan) dan filter berdasarkan jenis bangunan & RT/RW.
