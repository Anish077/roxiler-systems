# Roxiler Store Rating Platform

A full-stack MERN application for submitting and managing store ratings, with role-based access control.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Styling | Custom CSS (no UI library — hand-crafted dark theme) |

---

## Roles & Features

### System Administrator
- Dashboard with total users, stores, and ratings counts
- Add users (normal, admin, store owner)
- Add stores (assigned to a store owner)
- List & filter users by name, email, address, role
- List & filter stores by name, email, address
- Sortable tables (ascending / descending)
- Store owners display their store's average rating

### Normal User
- Register & log in
- Browse all stores with overall ratings
- Search stores by name or address
- Submit a rating (1–5 stars) for any store
- Update a previously submitted rating
- Change password

### Store Owner
- Log in
- Dashboard showing: store details, average rating, list of users who rated
- Change password

---

## Form Validation Rules (enforced frontend + backend)

| Field | Rule |
|-------|------|
| Name | 20–60 characters |
| Address | Max 400 characters |
| Password | 8–16 chars · ≥1 uppercase · ≥1 special character |
| Email | Standard email format |

---

## Project Structure

```
roxiler/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/         User.js · Store.js · Rating.js
│   │   ├── controllers/    authController · adminController · userController · ownerController
│   │   ├── routes/         auth · admin · user · owner
│   │   ├── middlewares/    auth.js · validation.js
│   │   └── app.js
│   ├── seed.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── components/common/   AppLayout · StarRating · SortableTable
    │   ├── context/             AuthContext.js
    │   ├── pages/
    │   │   ├── auth/            LoginPage · SignupPage
    │   │   ├── admin/           AdminDashboard · AdminUsers · AdminStores
    │   │   ├── user/            UserStores
    │   │   ├── owner/           OwnerDashboard
    │   │   └── common/          ChangePassword
    │   ├── services/api.js
    │   ├── utils/validators.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## Setup & Running

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally OR a MongoDB Atlas connection string

### 1. Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET

# Seed the admin user
node seed.js

# Start dev server
npm run dev
# → http://localhost:5000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# (Optional) Create .env for custom API URL
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start dev server
npm start
# → http://localhost:3000
```

---

## API Reference

### Auth  `POST /api/auth/...`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Normal user registration |
| POST | `/login` | Login (all roles) |
| POST | `/change-password` | Change own password (authenticated) |
| GET | `/me` | Get current user |

### Admin  `GET/POST /api/admin/...`
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Stats: users, stores, ratings |
| GET | `/users` | List users (filter/sort via query params) |
| GET | `/stores` | List stores (filter/sort) |
| GET | `/owners` | List store owners (for dropdown) |
| POST | `/create-user` | Create any role user |
| POST | `/create-store` | Create a store |

### Normal User  `/api/user/...`
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/stores` | List stores with avg + user rating |
| POST | `/ratings` | Submit a rating |
| PUT | `/ratings/:id` | Update a rating |

### Store Owner  `/api/owner/...`
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Store info + ratings + average |

---

## Default Admin Credentials (after running seed.js)

```
Email:    admin@roxiler.com
Password: Admin@1234
```

## Deployment

### Backend → Render / Railway
1. Set env vars: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`
2. Build command: `npm install`
3. Start command: `node src/app.js`

### Frontend → Vercel / Netlify
1. Set `REACT_APP_API_URL` to your backend URL
2. Build command: `npm run build`
3. Output dir: `build`

---

## Key Design Decisions

- **Single login endpoint** for all roles — role routing happens client-side after JWT decode
- **Unique rating constraint** enforced at DB level (`user + store` compound unique index)
- **Password hashing** uses bcrypt with salt rounds = 12
- **JWT stored in localStorage** — interceptor auto-attaches to every request
- **Dual validation** — client-side for UX, server-side via `express-validator` for security
