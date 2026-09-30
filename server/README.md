# Pulse Clinic API

Node + Express + MongoDB backend shared by the customer website and the five consoles (`/admin`, `/staff`, `/hr`, `/billing`, `/pharmacy`).

## Run locally

```bash
cp .env.example .env        # edit if your MongoDB is not on localhost:27017
npm install
npm run seed                # drops and re-creates every collection with demo data
npm run dev:all             # API on :4000 + Vite on :5173 (Vite proxies /api)
```

Or separately: `npm run server` and `npm run dev`.

## Logins (seeded)

| Console | Email | Password |
|---|---|---|
| Admin | admin@pulse.com · reception@pulse.com | admin123 |
| Admin (manager) | manager@pulse.com | staff123 |
| Staff / HR | any staff email, e.g. priya@pulse.com, hr@pulse.com, manager@pulse.com | staff123 |
| Billing | cashier@pulse.com | admin123 |
| Pharmacy | pharmacy@pulse.com | admin123 |

`admin@pulse.com` can open every console.

## How the front-end talks to it

- `GET /api/bootstrap` once at startup fills an in-memory cache (`src/services/api.js`). Pages keep using the synchronous store functions.
- Every store write is mirrored to localStorage (offline copy) and `PUT /api/data/:key` (upsert by id, delete missing ids).
- `GET /api/events` (SSE) tells other browsers which key changed so they re-fetch it.
- If the API is unreachable the app runs from the local copy and syncs when it is back.

## Endpoints

- `POST /api/auth/login { email, password }` → `{ token, user }` · `GET /api/auth/me`
- `GET /api/bootstrap` · `GET|PUT /api/data/:key`
- `GET|POST /api/:collection` · `GET|PATCH|DELETE /api/:collection/:id` — collections: doctors, appointments, patients, bookings, notifications, staff, leaveRequests, shifts, shiftRequests, overtime, concerns, holidays, payrollRuns, announcements, bills, medicines, pharmacyBills, medicineRequests
- `GET /api/health`

Public without a token: doctors, content, theme, doctor leaves, bookings (read + write). Everything else needs `Authorization: Bearer <token>`.

## Deploy

1. Create a MongoDB Atlas cluster, copy its connection string into `MONGODB_URI`.
2. Deploy this repo to a Node host (Render, Railway, Fly, a VPS) with start command `node server/index.js` and env `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN=https://pulseclinicpr.netlify.app`. Run `node server/seed.js` once against Atlas.
3. In Netlify set the build environment variable `VITE_API_URL=https://<your-api-host>/api` and redeploy.

### Vercel

The API is deployed at `https://pulseclinic-server.vercel.app` as a Vercel project whose Root Directory is `server/`. Vercel installs `server/package.json` and runs the app exported from `index.js` as one function, so keep that file's dependencies in step with the root `package.json`.

- Set `MONGODB_URI`, `DB_NAME`, `JWT_SECRET` and `CLIENT_ORIGIN` under Project Settings → Environment Variables, then redeploy.
- Atlas → Network Access must allow `0.0.0.0/0`, because Vercel has no fixed outgoing IP.
- `/api/events` (SSE) is cut when the function reaches its maximum duration and the browser reconnects; a change is only pushed to browsers connected to the same function instance, so live refresh between devices is best-effort there.
