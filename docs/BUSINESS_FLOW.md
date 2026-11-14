# Business Flow — ExpoSpace

Dokumentasi alur bisnis program **ExpoSpace** (aplikasi pameran proyek Capstone).
Sumber: `routes/web.php`, `routes/api.php`, `app/Http/Controllers/*`, `app/Models/*`, `resources/js/app.jsx`.

- **Diagram interaktif (drag & drop):** buka [`business-flow.html`](./business-flow.html) di browser.
- **Stack:** Laravel 10 (PHP 8.1) + React 18 (Vite) + MySQL, autentikasi session-based.

---

## 1. Ringkasan produk

ExpoSpace menghubungkan dua pihak:

| Pihak | Role | Kebutuhan |
|---|---|---|
| **Capstone** (mahasiswa) | `capstone` | Mempublikasikan proyek (poster, landing page, business flow, aplikasi) dan mengumpulkan penilaian dari mitra. |
| **Mitra** (industri) | `mitra` | Menemukan, meninjau, lalu menilai proyek Capstone lewat kuesioner. |

Nilai bisnisnya: **Capstone mendapat eksposur & umpan balik terukur (skor 1–5)**, **Mitra mendapat kanal penjajakan talenta/teknologi**.

---

## 2. Aktor & hak akses

| Aktor | Session role | Boleh |
|---|---|---|
| Capstone | `capstone` | CRUD tim, 4 komponen proyek, editor kuesioner, preview, publish |
| Mitra | `mitra` | Melihat proyek yang **sudah published**, detail, isi kuesioner |
| Publik (tanpa login) | — | `GET /api/projects` (hanya proyek published) |

Aturan pokok:

- Endpoint `/capstone/data/*` di-wrap middleware `auth` **dan** `abort_unless(role === 'capstone', 403)`.
- `/mitra/data/questionnaire/{team}` dan `GET /api/projects/{team}` → `404` bila `teams.is_published = false`.
- Mitra **tidak wajib** login untuk mengisi kuesioner (endpoint `/mitra/data/*` tidak dibatasi middleware `auth`; jawaban disimpan dengan `user_id = null`).

---

## 3. Alur utama (end-to-end)

### A. Sisi Capstone — dari daftar sampai publish

1. **Daftar / Login** — `POST /auth/register` (`name`, `email`, `password` min 8, `role = capstone`) → `Auth::login` + `session()->regenerate()` → redirect `/capstone/dashboard`.
2. **Buat data tim & proyek** — `POST /capstone/data/team` (`updateOrCreate` berdasarkan `owner_id`): `team_name`, `project_title`, `project_description`, `category`.
3. **Lengkapi 4 komponen** (masing-masing `hasOne` di tabel `teams`, jadi satu tim hanya punya satu record per komponen):

   | # | Komponen | Endpoint | Input | Tabel / Storage |
   |---|---|---|---|---|
   | 01 | Poster | `POST /capstone/data/poster` | `poster_image`, gambar `jpg/jpeg/png/webp`, maks **5 MB** | `posters` + `storage/app/public/posters` |
   | 02 | Landing page | `POST /capstone/data/component/landing-page` | `landing_page_url` (`required`, `url`, maks 255) | `landing_pages` |
   | 03 | Business flow | `POST /capstone/data/component/business-flow` | `business_flow_type = url\|image`; jika `url` → `business_flow_url`; jika `image` → `business_flow_image` (`jpg/jpeg/png/webp`, maks 5 MB) | `business_flows` + `storage/app/public/business-flows` |
   | 04 | Application | `POST /capstone/data/component/application` | `application_url` (`required`, `url`, maks 255) | `applications` |

   Semua komponen memakai pola **`updateOrCreate(['team_id' => ...])`** → simpan = *upsert*, bukan duplikat.
   Ganti gambar (poster / business flow) otomatis **menghapus file lama** via `Storage::disk('public')->delete()`.
4. **Atur kuesioner** — `GET /capstone/data/questionnaire` memicu **seed otomatis 10 pertanyaan template** (4 bagian: Kemudahan Penggunaan, Pengelolaan Proyek, Fitur dan Informasi, Kepuasan dan Manfaat) saat belum ada data. `PUT /capstone/data/questionnaire` menyimpan perubahan lewat `DB::transaction` (**delete-all lalu insert ulang**, `sort_order` = urutan array).
5. **Preview** — halaman `/capstone/preview` menampilkan poster, iframe landing page/aplikasi, dan business flow (iframe bila `url`, `<img>` bila `image`) persis seperti yang akan dilihat Mitra.
6. **Publish** — `POST /capstone/data/publish`:
   - Syarat: `poster && landingPage && businessFlow && application` semuanya ada.
   - Belum lengkap → **`422` "Lengkapi semua komponen project sebelum publikasi."**
   - Lolos → `teams.is_published = true`.

```
Daftar/Login ──► Data tim ──► 4 komponen ──► Atur kuesioner ──► Preview ──► Publish
                 (upsert)     (upsert)         (transaksi)                   │
                                                                             ▼
                                                              tampil di dashboard Mitra
```

### B. Sisi Mitra — dari penjusukan sampai feedback

1. **Daftar / Login** — `POST /auth/register` (`role = mitra`) → redirect `/mitra/dashboard`.
2. **Jelajahi proyek** — `GET /api/projects` hanya mengembalikan `is_published = true` (`latest()`, `paginate(12)`), mendukung pencarian `team_name`/`project_title`. Frontend menambah filter pencarian & kategori secara client-side.
3. **Detail proyek** — `/mitra/project/{id}` menampilkan poster + 3 tab: **Landing page**, **Business flow**, **Application** (preview iframe dengan zoom, atau gambar).
4. **Isi kuesioner** — `GET /mitra/data/questionnaire/{team}` (404 bila belum published).
   Form = identitas responden (`respondent_name` wajib, `respondent_address` wajib, `respondent_affiliation` opsional: `internal_ti` / `external`) + penilaian **setiap** pertanyaan dengan skala **1–5** (STS/TS/N/S/SS).
5. **Submit** — `POST /mitra/data/questionnaire/{team}`:
   - `422` bila jumlah jawaban ≠ jumlah pertanyaan atau ada ID pertanyaan asing ("Semua pertanyaan wajib dijawab.").
   - Lolos → `DB::transaction`: insert `questionnaire_responses` lalu `questionnaire_answers` (`score` 1–5, unik per `response_id + question_id`).
   - Berhasil → "Kuesioner berhasil disimpan."

```
Jelajahi proyek ──► Detail ──► Preview konten ──► Isi kuesioner ──► Submit ──► Feedback tersimpan
                        │                              ▲
                        └──── Isi kuesioner (opsional) ┘
```

---

## 4. Peta route

### Web (session + CSRF)

| Method | URI | Controller | Catatan |
|---|---|---|---|
| GET | `/`, `/login`, `/signup` | view `welcome` | SPA shell (React Router) |
| GET | `/capstone/dashboard`, `/capstone/{section}` | view `welcome` | `section` ∈ poster, landing-page, business-flow, application, preview, questionnaire |
| GET | `/mitra/dashboard`, `/mitra/project/{projectId}`, `/mitra/questionnaire/{projectId}` | view `welcome` | |
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | `AuthController` | |
| GET | `/capstone/data` | `CapstoneController@data` | tim + relasi komponen milik `owner_id` |
| POST | `/capstone/data/team` | `CapstoneController@team` | upsert tim |
| POST | `/capstone/data/publish` | `CapstoneController@publish` | validasi 4 komponen |
| POST | `/capstone/data/poster` | `CapstoneController@poster` | multipart |
| POST | `/capstone/data/component/{type}` | `CapstoneController@component` | `landing-page\|business-flow\|application` |
| DELETE | `/capstone/data/component/{type}` | `CapstoneController@destroy` | `poster\|landing-page\|business-flow\|application` |
| GET/PUT | `/capstone/data/questionnaire` | `QuestionnaireController@questions/updateQuestions` | seed + replace |
| GET/POST | `/mitra/data/questionnaire/{team}` | `QuestionnaireController@mitraQuestions/answer` | hanya tim published |

### API (Sanctum)

| Method | URI | Catatan |
|---|---|---|
| GET | `/api/user` | user dari token |
| resource | `/api/todos` | sisa modul Todo (belum terhubung UI) |
| GET | `/api/projects` | hanya published, `?search=`, `paginate(12)` |
| GET | `/api/projects/{team}` | 404 bila belum published |

---

## 5. Aturan bisnis (validasi & guard)

| ID | Aturan | Saat gagal |
|---|---|---|
| BR-01 | Hanya `role = capstone` yang boleh mengubah data di `/capstone/data/*` | `403` |
| BR-02 | Satu akun = satu tim (`owner_id` unique secara praktis via `updateOrCreate`) | data ditimpa, bukan duplikat |
| BR-03 | URL landing page & aplikasi wajib valid `http(s)` dan ≤ 255 karakter | `422` + pesan field |
| BR-04 | Business flow bertipe `url` **atau** `image`, tidak keduanya — field lain di-set `null` | `422` |
| BR-05 | Business flow bertipe `image` wajib punya file; update tanpa file baru memakai file lama | `422` "Gambar business flow wajib diunggah." |
| BR-06 | Gambar (poster/business flow): `jpg/jpeg/png/webp`, maks 5.120 KB; file lama dihapus saat diganti | `422` |
| BR-07 | Publish hanya bila 4 komponen lengkap | `422` "Lengkapi semua komponen project sebelum publikasi." |
| BR-08 | Kuesioner hanya untuk tim published | `404` |
| BR-09 | Semua pertanyaan wajib dijawab, nilai integer 1–5 | `422` "Semua pertanyaan wajib dijawab." |
| BR-10 | Identitas responden: nama & alamat wajib; asal responden opsional (`internal_ti`/`external`) | `422` |
| BR-11 | Simpan kuesioner & update soal dilakukan dalam `DB::transaction` | rollback, tidak ada data setengah jadi |
| BR-12 | Kuesioner opsional — Mitra dapat menelusuri proyek tanpa mengisi | alur tetap lanjut |

---

## 6. Model data & relasi

```
users (role: mitra | capstone)
  └── 1 ─ teams (uuid, is_published)          owner_id
          ├── 1 ─ posters        (poster_image)
          ├── 1 ─ landing_pages  (landing_page_url)
          ├── 1 ─ business_flows (type, url, image)
          ├── 1 ─ applications   (application_url)
          ├── 1..n questionnaire_questions  (section, question, sort_order)
          └── 1..n questionnaire_responses  (respondent_*, user_id nullable)
                    └── 1..n questionnaire_answers (score 1–5)
```

Status proyek hanya punya **satu sakelar**: `teams.is_published` (`false` = draft/tersembunyi → `true` = tampil untuk Mitra).

---

## 7. Titik kelemahan / catatan pengembangan

| # | Temuan | Dampak | Saran |
|---|---|---|---|
| 1 | **Belum ada endpoint untuk melihat hasil kuesioner.** `questionnaire_answers` hanya ditulis, tidak pernah dibaca. | Capstone mengumpulkan skor tapi tidak bisa membacanya di aplikasi. | Tambah `GET /capstone/data/questionnaire/results` + rekap skor per bagian (rata-rata, jumlah responden). |
| 2 | `POST /mitra/data/questionnaire/{team}` tidak dibatasi login. | Siapa pun bisa mengirim jawaban berulang (reputasi skor mudah dimanipulasi). | Opsional: batasi login mitra / satu jawaban per IP+tim / honeypot. |
| 3 | Modul `Todo` (`/api/todos`) dan `ProjectController` lama (`GET /api/projects/{team}`) tidak dipakai UI. | Kode mati, menambah permukaan API. | Hapus atau gabungkan. |
| 4 | Tidak ada mekanisme **unpublish** / edit project setelah publish. | Proyek yang sudah tayang sulit ditarik. | Tambah `POST /capstone/data/unpublish` dan flag revisi. |
| 5 | Business flow hanya menerima URL/gambar eksternal. | Kualitas diagram bergantung pada unggahan tiap tim. | Opsional: editor business flow bawaan aplikasi (node + connector). |
| 6 | `questionnaire_responses` unik pada `(team_id, user_id)`; `user_id` sering `NULL`. | Aman di MySQL/Postgres (NULL tak dihitung unique), tapi jawaban anonim tak terlacak. | Kaitkan ke session/IP bila perlu audit. |

---

## 8. Ringkasan diagram

Buka [`business-flow.html`](./business-flow.html) untuk diagram drag & drop (3 kolam: **Capstone**, **Sistem**, **Mitra**).
Fitur diagram: geser node bebas, klik dua kali untuk mengubah teks, mode *Hubungkan* untuk menambah panah, zoom, dan tata letak tersimpan otomatis di `localStorage`.
