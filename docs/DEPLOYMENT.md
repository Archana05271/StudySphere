# Deployment guide (Task 15)

Stack: **MongoDB Atlas** (database) → **Render** (backend API + Socket.IO) → **Vercel** (React frontend).
Deploy in this order because each step needs the URL from the previous one.

## 1. Database – MongoDB Atlas
1. Create a free account at https://www.mongodb.com/atlas and create a free **M0** cluster.
2. *Database Access* → add a database user (username + strong password).
3. *Network Access* → add IP `0.0.0.0/0` (Render's IPs change on the free plan).
4. *Connect → Drivers* → copy the connection string and add a database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/studysphere?retryWrites=true&w=majority`

## 2. Backend – Render
1. Push the repo to GitHub (see README → "Push to GitHub").
2. Render → **New → Blueprint** → select the repo (it reads `render.yaml`), or **New → Web Service** with:
   Root directory `backend`, Build `npm install`, Start `npm start`, Health check `/api/health`.
3. Environment variables: `MONGO_URI` (from step 1), `JWT_SECRET` (any 48+ random chars), `JWT_EXPIRES_IN=1h`, `NODE_ENV=production`, `CLIENT_URL=https://YOUR-APP.vercel.app` (set after step 3; you can come back and edit it).
4. After deploy, open `https://YOUR-API.onrender.com/api/health` → `{"status":"healthy","database":"connected"}`.
5. Create the admin account: Render → service → **Shell** → `ADMIN_EMAIL=you@x.com ADMIN_PASSWORD='a-long-password' npm run create-admin`
   (or run it from your laptop with `MONGO_URI` pointing at Atlas).

> Free Render services sleep after ~15 min idle; the first request can take ~30 s.

## 3. Frontend – Vercel
1. Vercel → **Add New → Project** → import the repo (framework: Vite, root: repository root).
2. Environment variables:
   - `VITE_API_URL` = `https://YOUR-API.onrender.com/api/v1`
   - `VITE_SOCKET_URL` = `https://YOUR-API.onrender.com`
3. Deploy. `vercel.json` already rewrites all routes to `index.html`, so refreshing `/student/dashboard` works.
4. Go back to Render and set `CLIENT_URL` to the final Vercel URL (comma-separate several origins if needed) → redeploy.

## 4. Post-deploy test checklist
- [ ] `/api/health` reports `connected`
- [ ] Register a student → login → dashboard shows your data
- [ ] Admin login → create a course → student sees it and enrolls
- [ ] Open two browsers (student A, student B) → chat messages arrive instantly
- [ ] Admin announcement appears live for a logged-in student
- [ ] Mobile (375px) and tablet (768px) layouts have no horizontal scroll
- [ ] Run the Postman collection with `baseUrl` set to the live API

Then add the live URLs to the top of `README.md`.
