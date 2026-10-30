# Testing (Task 9, 14, 15)

| Layer | How | Covers |
|---|---|---|
| Automated API + socket tests | `cd backend && npm test` | 15 tests: health, register/login, bcrypt hashing, 401/403, course CRUD, student CRUD, enrollment + progress, notifications, NoSQL-injection guard, malformed JSON, socket auth, real-time chat/presence |
| Postman | import `docs/StudySphere.postman_collection.json` | Every endpoint, with assertions; run the collection with the Runner |
| Manual / responsiveness | Chrome DevTools → device toolbar: 375 px, 768 px, 1440 px | No horizontal scroll, readable layouts |
| Real-time | Two browsers (or one normal + one private window), log in as two students → `/student/chat` | Message appears instantly; online/offline dots |

## Postman – how to run
1. Postman → **Import** → `docs/StudySphere.postman_collection.json`.
2. Collection **Variables**: `baseUrl` = `http://localhost:5000/api/v1` (or your Render URL + `/api/v1`), `adminEmail`, `adminPassword` = the admin you created.
3. Open the collection → **Run** → run all in order. Scripts save `adminToken`, `studentToken`, `courseId`, `studentId` automatically.
4. Screenshot the green runner results for your submission.

## Task-sheet error example
`POST /api/auth/login` with invalid body → **400 Bad Request** JSON (not a crash). Missing/invalid token → **401**. Wrong role → **403**.
