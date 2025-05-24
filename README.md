# Hotel Management System (MVP)

Full‑stack Node + React monorepo ready for your college major project.

## Quick Start

```bash
# clone
git clone <your‑repo‑url> hotel-mgmt
cd hotel-mgmt

# server
cd server
cp .env.example .env       # edit MONGO_URI & JWT_SECRET
npm install
npm run dev                # nodemon on :5000

# (optional) seed admin user
curl -X POST http://localhost:5000/api/auth/seed-admin

# client (new terminal)
cd ../client
npm install
npm run dev                # Vite on :5173
```

Login → **admin / admin123**

Enjoy 🚀
# hotel-mgmt
