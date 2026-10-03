# ifs24030-pabwer2026-reactjs

Aplikasi **Lost & Found Kampus** — Praktikum 4 PABWE 2026 (ReactJS, JavaScript).

| | |
|---|---|
| NIM | 11S24030 |
| Nama | Dian Rafael Tambunan |

Aplikasi untuk melaporkan barang hilang/ditemukan, memantau statusnya, dan melihat statistik.
Seluruh data berasal dari **Delcom Open API** (`https://open-api.delcom.org/api/v1`);
tidak ada backend atau database lokal.

## Teknologi

Bun, Vite, React 19, JavaScript, Tailwind CSS v4, Redux Toolkit, React Redux,
React Router DOM, SweetAlert2, Tabler Icons, Google Fonts (Plus Jakarta Sans),
Vitest, jsdom, React Testing Library, jest-dom.

## Cara menjalankan

```bash
bun install
bun run dev        # http://localhost:5173
```

Perintah lain:

```bash
bun run build          # build produksi ke dist/
bun run preview        # menjalankan hasil build
bun run test           # menjalankan seluruh test
bun run test:watch     # test mode watch
bun run test:coverage  # test + laporan coverage (threshold 100%)
```

Laporan coverage HTML ada di `coverage/index.html`.

## Environment variable

Salin `.env.example` menjadi `.env` bila belum ada.

| Variabel | Fungsi | Default |
|---|---|---|
| `DELCOM_BASEURL` | Base URL API | `https://open-api.delcom.org/api/v1` |
| `APP_PORT` | Port dev server & preview | `5173` |

`vite.config.js` menginjeksi `DELCOM_BASEURL` sebagai konstanta global saat build.
Nama `VITE_DELCOM_BASEURL` (seperti di modul praktikum) juga dibaca sebagai cadangan.
Tidak ada token/secret di source code; token login disimpan di `localStorage`.

## Struktur project

```text
src/
├── App.jsx, main.jsx, store.js, index.css, setupTests.js, test-utils.jsx
├── components/            Avatar, StatusBadge, ModalShell (dipakai bersama)
├── helpers/               apiHelper.js, toolsHelper.js
├── hooks/                 useInput.js
└── features/
    ├── auth/              api, states, layouts (AuthLayout), pages (Login, Register)
    ├── users/             api, states, pages (UsersPage, ProfilePage)
    └── lost-founds/       api, states, layouts, components, modals, pages
```

Alur login: `LoginPage → thunk (asyncLogin) → authApi → apiHelper → POST /auth/login →
token → putAccessToken() → state Redux → redirect ke /`.

Route (`React Router DOM`):

| Path | Halaman | Layout |
|---|---|---|
| `/auth/login`, `/auth/register` | Login, Register | AuthLayout |
| `/` | Daftar laporan | LostFoundLayout (dilindungi) |
| `/lost-founds/:id` | Detail laporan | LostFoundLayout |
| `/stats` | Statistik harian/bulanan | LostFoundLayout |
| `/users` | Daftar pengguna | LostFoundLayout |
| `/profile` | Profil, foto, kata sandi | LostFoundLayout |

Tanpa token, atau jika profil gagal dimuat, `LostFoundLayout` mengarahkan ke `/auth/login`.
Pengguna yang sudah login diarahkan menjauh dari `/auth/*`.

## Endpoint yang digunakan

Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`

Users: `GET /users`, `GET /users/:id`, `GET /users/me`, `PUT /users/me`,
`POST /users/me/photo`, `PUT /users/password`

Lost & Found: `GET /lost-founds` (query `status`, `is_completed`, `is_me`),
`GET /lost-founds/:id`, `POST /lost-founds`, `PUT /lost-founds/:id`,
`POST /lost-founds/:id/cover`, `DELETE /lost-founds/:id`,
`GET /lost-founds/stats/daily`, `GET /lost-founds/stats/monthly` (query `total_data`)

## Perbedaan dengan requirement awal (mengikuti dokumentasi API)

- **Ganti password** memakai `PUT /users/password` (bukan `/users/me/password`).
- **Live search** dilakukan di sisi klien (judul, deskripsi, pelapor) karena API tidak punya parameter pencarian.
- **Statistik**: `end_date` dan `total_data` dikirim sebagai query string (request GET). Aplikasi mengirim `total_data` 7 (harian) dan 6 (bulanan).
- `cover` dan `photo` dari API bisa berupa path relatif (`img/...`); `assetUrl()` mengubahnya menjadi URL penuh.
- Halaman statistik berada di route tambahan `/stats` (menu "Statistik" di sidebar).
- Tombol ubah/hapus hanya tampil untuk pemilik laporan (`user_id` sama dengan profil aktif).
- Key reducer di store adalah `lostFounds` (bukan `lost-founds`) agar mudah diakses.
- Versi paket disesuaikan dengan yang tersedia saat project dibuat (mis. Vite 7, Vitest 3); ubah di `package.json` bila dosen mensyaratkan versi tertentu.
