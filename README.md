# Moonchaery Studio

**Moonchaery Studio** adalah platform portofolio digital high-fidelity yang menggabungkan desain karakter etereal dengan teknologi imersif 3D. Dibangun menggunakan Next.js 16, Three.js, dan Supabase untuk memberikan pengalaman galeri virtual yang premium dan responsif.

---

## Fitur Utama

- **Immersive 3D Gallery**: Galeri virtual 3D interaktif yang dibangun dengan Three.js & React Three Fiber, mendukung kontrol mouse (Desktop) dan Virtual Joystick (Mobile).
- **Admin Production Hub**: Dashboard manajemen proyek lengkap untuk mengelola karya galeri, memantau pesanan komisi, dan update status produksi.
- **4-Stage Commission Workflow**: Sistem pelacakan pesanan otomatis (Review -> Sketch -> WIP -> Finalization) dengan integrasi notifikasi email.
- **Advanced SEO & GEO**: Optimasi data terstruktur (JSON-LD), sitemap dinamis, dan GEO (Generative Engine Optimization) agar mudah dikutip oleh AI seperti ChatGPT & Perplexity.
- **Security Hardening**: Proteksi endpoint API berbasis email admin dan Row Level Security (RLS) pada database Supabase.

---

## Tech Stack

- **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/), [Tailwind CSS 4](https://tailwindcss.com/)
- **3D Engine**: [Three.js](https://threejs.org/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **Email**: [Resend](https://resend.com/)

---

## Persiapan Pengembangan (Local Setup)

### 1. Clone Repositori
```bash
git clone [url-repo-anda]
cd portfolio
```

### 2. Instalasi Dependency
```bash
npm install
```

### 3. Konfigurasi Environment
Salin file `.env.example` menjadi `.env.local` dan isi dengan kredensial Anda:
```bash
cp .env.example .env.local
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) untuk melihat hasilnya.

---

## Struktur Folder

```text
src/
├── app/             # Routing & Server Components (Next.js)
├── components/
│   ├── sections/    # Komponen Landing Page (Hero, FAQ, dll)
│   ├── ui/          # Komponen UI Reusable (Navbar, Footer)
│   └── gallery/     # Logika & Aset Galeri 3D
├── lib/             # Konfigurasi Library (Supabase Client)
├── utils/           # Helper functions & API handlers
└── config/          # Statis data & Konfigurasi tema
```

---

## Deployment (Vercel)

1. Hubungkan repositori GitHub Anda ke [Vercel](https://vercel.com).
2. Tambahkan **Environment Variables** sesuai yang ada di file `.env.example`.
3. Klik **Deploy**. Website akan otomatis online dengan SSL aktif.

---

## Lisensi

Proyek ini bersifat privat untuk **Moonchaery Studio**. Seluruh aset visual dan kode sumber dilindungi hak cipta.

---

*Handcrafted for Moonchaery Studio.*
