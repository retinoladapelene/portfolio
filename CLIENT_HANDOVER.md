# Moonchaery Studio - Project Handover Document

Dokumen ini berisi informasi krusial untuk operasional, pemeliharaan, dan pengembangan website Moonchaery Studio setelah proses serah terima.

---

## 1. Akses & Kredensial (Wajib Diisi oleh Klien)

| Layanan | Kategori | Kredensial |
| :--- | :--- | :--- |
| **Supabase** | Database & Auth | [Klien mengisi di sini] |
| **Vercel** | Hosting & Deployment | [Klien mengisi di sini] |
| **Resend** | Email Notification API | [Klien mengisi di sini] |
| **Admin Dashboard** | CMS Internal | `/admin` (Login via Email Admin) |

---

## 2. Dokumentasi Teknis

### Struktur Folder Utama
- src/app: Logika halaman utama (Next.js App Router).
- src/components/sections: Komponen UI (Hero, Pricing, FAQ).
- src/app/gallery: Engine Galeri 3D (Three.js/Fiber).
- src/lib/supabase: Konfigurasi koneksi database.

### Konfigurasi Environment (.env)
Pastikan variabel berikut terkonfigurasi di Vercel:
- NEXT_PUBLIC_SUPABASE_URL: Endpoint database.
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Kunci akses publik.
- SUPABASE_SERVICE_ROLE_KEY: Kunci akses admin (Rahasia).
- ADMIN_EMAIL: Email utama pemilik studio.
- ALLOWED_ADMIN_EMAILS: Daftar email yang diizinkan masuk ke dashboard.

---

## 3. Fitur SEO & Discovery (Sudah Diimplementasikan)

Website ini telah dioptimasi untuk mesin pencari (Google) dan AI (ChatGPT/Perplexity):
- **Sitemap Dinamis**: /sitemap.xml (Otomatis memperbarui daftar karya).
- **Robots.txt**: /robots.txt (Mengatur crawler mana yang boleh masuk).
- **JSON-LD (Structured Data)**: Menggunakan schema ArtGallery dan VisualArtsEvent untuk hasil pencarian kaya (Rich Snippets).
- **GEO (Generative Engine Optimization)**: Section FAQ terstruktur untuk memudahkan AI mengutip studio Anda.

---

## 4. Panduan Operasional (CMS)

### Menambah/Mengedit Karya Seni
1. Login ke /admin menggunakan email yang terdaftar di ALLOWED_ADMIN_EMAILS.
2. Buka tab Gallery Manager.
3. Unggah gambar, berikan judul dan deskripsi.
4. Karya akan otomatis muncul di Immersive 3D Gallery.

### Mengelola Pesanan (Commissions)
1. Notifikasi email akan dikirim melalui Resend setiap kali ada pesanan baru.
2. Kelola status produksi (Review -> Sketch -> WIP -> Final) melalui dashboard admin.
3. Klien Anda dapat memantau progres secara mandiri melalui halaman /track.

---

## 5. Pemeliharaan & Keamanan

- SSL/HTTPS: Dikelola secara otomatis oleh Vercel.
- Security Hardening: Endpoint API krusial sudah diproteksi dengan verifikasi email admin.
- Database Backup: Supabase melakukan backup harian secara otomatis (Tergantung paket yang dipilih).

---

## 6. Kontak & Support

- Developer: [Nama Anda/Perusahaan Anda]
- Email Support: [Email Anda]
- Dokumentasi Lanjutan: [Link Figma/Dokumen lain jika ada]

---

*Terakhir Diperbarui: 14 Mei 2024*
