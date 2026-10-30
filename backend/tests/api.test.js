// Integration tests: REST API + JWT + roles + enrollments + real-time chat.
// Uses TEST_MONGO_URI if set, otherwise an in-memory MongoDB (mongodb-memory-server).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import request from 'supertest';
import { io as Client } from 'socket.io-client';
import bcrypt from 'bcryptjs';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_that_is_definitely_longer_than_32_chars';
process.env.CLIENT_URL = 'http://localhost:3000';

const { default: createApp } = await import('../app.js');
const { initSockets } = await import('../sockets/index.js');
const { connectDB, disconnectDB } = await import('../config/db.js');
const { default: User } = await import('../models/User.js');
const mongoose = (await import('mongoose')).default;

let memory, server, app, url, adminToken, studentToken, student2Token, studentId, student2Id, courseId;

before(async () => {
  let uri = process.env.TEST_MONGO_URI;
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memory = await MongoMemoryServer.create();
    uri = memory.getUri('studysphere_test');
  }
  await connectDB(uri);
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  app = createApp();
  server = http.createServer(app);
  app.set('io', initSockets(server, ['http://localhost:3000']));
  await new Promise((r) => server.listen(0, r));
  url = `http://localhost:${server.address().port}`;
  await User.create({ name: 'Admin', email: 'admin@test.com', password: await bcrypt.hash('AdminPass12345', 10), role: 'admin' });
});

after(async () => {
  server?.closeAllConnections?.();
  await new Promise((r) => server.close(r));
  await mongoose.connection.dropDatabase();
  await disconnectDB();
  await memory?.stop();
});

const login = async (email, password) => (await request(app).post('/api/v1/auth/login').send({ email, password })).body.token;

test('health and root endpoints', async () => {
  assert.equal((await request(app).get('/')).status, 200);
  const h = await request(app).get('/api/health');
  assert.equal(h.body.status, 'healthy');
  assert.equal(h.body.database, 'connected');
});

test('registration validates input and never creates admins', async () => {
  const bad = await request(app).post('/api/v1/auth/register').send({ name: 'A', email: 'nope', password: '123' });
  assert.equal(bad.status, 400);
  const badPhone = await request(app).post('/api/v1/auth/register').send({ name: 'Bob Ray', email: 'bob@test.com', password: 'password123', phone: 'abc' });
  assert.equal(badPhone.status, 400);
  const ok = await request(app).post('/api/v1/auth/register').send({ name: 'Alice Doe', email: 'Alice@Test.com', password: 'password123', department: 'CS', phone: '+91 98765 43210', role: 'admin' });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.user.role, 'student');
  assert.equal(ok.body.user.email, 'alice@test.com');
  assert.equal(ok.body.user.password, undefined);
  studentId = ok.body.user.id;
  const dup = await request(app).post('/api/v1/auth/register').send({ name: 'Alice Doe', email: 'alice@test.com', password: 'password123' });
  assert.equal(dup.status, 409);
  const second = await request(app).post('/api/v1/auth/register').send({ name: 'Carl Poe', email: 'carl@test.com', password: 'password123' });
  student2Id = second.body.user.id;
});

test('passwords are stored hashed', async () => {
  const user = await User.findOne({ email: 'alice@test.com' }).select('+password').lean();
  assert.notEqual(user.password, 'password123');
  assert.match(user.password, /^\$2[aby]\$/);
});

test('login issues a JWT; bad credentials give 401', async () => {
  assert.equal((await request(app).post('/api/v1/auth/login').send({ email: 'alice@test.com', password: 'wrongpassword' })).status, 401);
  studentToken = await login('alice@test.com', 'password123');
  student2Token = await login('carl@test.com', 'password123');
  adminToken = await login('admin@test.com', 'AdminPass12345');
  assert.ok(studentToken && adminToken);
});

test('protected routes reject missing/invalid tokens with 401', async () => {
  assert.equal((await request(app).get('/api/v1/students')).status, 401);
  assert.equal((await request(app).get('/api/v1/auth/me').set('Authorization', 'Bearer garbage')).status, 401);
  assert.equal((await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${studentToken}`)).status, 200);
});

test('role checks: students cannot use admin endpoints (403)', async () => {
  const auth = { Authorization: `Bearer ${studentToken}` };
  assert.equal((await request(app).get('/api/v1/students').set(auth)).status, 403);
  assert.equal((await request(app).post('/api/v1/courses').set(auth).send({ title: 'x', department: 'y' })).status, 403);
});

test('course CRUD (admin)', async () => {
  const auth = { Authorization: `Bearer ${adminToken}` };
  assert.equal((await request(app).post('/api/v1/courses').set(auth).send({ title: '', department: 'CS' })).status, 400);
  const created = await request(app).post('/api/v1/courses').set(auth).send({ title: 'Full Stack', department: 'CS', description: 'MERN', duration: '8 weeks', instructor: 'Dr. K', totalLessons: 4 });
  assert.equal(created.status, 201);
  courseId = created.body.course._id;
  assert.equal((await request(app).get('/api/v1/courses')).body.count, 1);
  assert.equal((await request(app).get(`/api/v1/courses/${courseId}`)).body.course.duration, '8 weeks');
  assert.equal((await request(app).get('/api/v1/courses/not-an-id')).status, 400);
  const upd = await request(app).put(`/api/v1/courses/${courseId}`).set(auth).send({ title: 'Full Stack Pro', department: 'CS' });
  assert.equal(upd.body.course.title, 'Full Stack Pro');
});

test('student CRUD (admin) and profile update', async () => {
  const auth = { Authorization: `Bearer ${adminToken}` };
  assert.equal((await request(app).get('/api/v1/students').set(auth)).body.count, 2);
  assert.equal((await request(app).get(`/api/v1/students/${studentId}`).set(auth)).body.student.email, 'alice@test.com');
  const upd = await request(app).put(`/api/v1/students/${studentId}`).set(auth).send({ department: 'IT' });
  assert.equal(upd.body.student.department, 'IT');
  const me = await request(app).put('/api/v1/auth/me').set({ Authorization: `Bearer ${studentToken}` }).send({ name: 'Alice D.' });
  assert.equal(me.body.user.name, 'Alice D.');
  const created = await request(app).post('/api/v1/students').set(auth).send({ name: 'Temp User', email: 'temp@test.com', password: 'password123' });
  assert.equal(created.status, 201);
  assert.equal((await request(app).delete(`/api/v1/students/${created.body.student.id}`).set(auth)).status, 200);
  assert.equal((await request(app).delete(`/api/v1/students/${created.body.student.id}`).set(auth)).status, 404);
});

test('enrollment workflow: enroll, duplicate, progress, completion, notifications', async () => {
  const auth = { Authorization: `Bearer ${studentToken}` };
  assert.equal((await request(app).post('/api/v1/enrollments').set(auth).send({ courseId })).status, 201);
  assert.equal((await request(app).post('/api/v1/enrollments').set(auth).send({ courseId })).status, 409);
  assert.equal((await request(app).post('/api/v1/enrollments').set(auth).send({ courseId: 'bad' })).status, 400);
  const mine = await request(app).get('/api/v1/enrollments/me').set(auth);
  assert.equal(mine.body.count, 1);
  assert.equal(mine.body.enrollments[0].progress.totalLessons, 4);
  assert.equal((await request(app).patch(`/api/v1/enrollments/${courseId}/progress`).set(auth).send({ completedLessons: 9 })).status, 400);
  const half = await request(app).patch(`/api/v1/enrollments/${courseId}/progress`).set(auth).send({ completedLessons: 2 });
  assert.equal(half.body.progress.progressPercentage, 50);
  const done = await request(app).patch(`/api/v1/enrollments/${courseId}/progress`).set(auth).send({ completedLessons: 4 });
  assert.equal(done.body.status, 'completed');
  const notes = await request(app).get('/api/v1/notifications').set(auth);
  assert.equal(notes.body.count, 2);
  assert.equal(notes.body.unread, 2);
  assert.equal((await request(app).patch(`/api/v1/notifications/${notes.body.notifications[0].id}/read`).set(auth)).body.notification.isRead, true);
  assert.equal((await request(app).get('/api/v1/enrollments').set({ Authorization: `Bearer ${adminToken}` })).body.count, 1);
});

test('admin announcement reaches students', async () => {
  const sent = await request(app).post('/api/v1/notifications').set({ Authorization: `Bearer ${adminToken}` }).send({ title: 'Hello', message: 'Exam on Friday' });
  assert.equal(sent.status, 201);
  assert.equal(sent.body.sent, 2);
  assert.equal((await request(app).post('/api/v1/notifications').set({ Authorization: `Bearer ${studentToken}` }).send({ message: 'x' })).status, 403);
});

test('malformed JSON and unknown routes return JSON errors, not crashes', async () => {
  const bad = await request(app).post('/api/v1/auth/login').set('Content-Type', 'application/json').send('{bad json');
  assert.equal(bad.status, 400);
  assert.equal((await request(app).get('/api/v1/nope')).status, 404);
});

test('NoSQL operator injection in login is neutralised', async () => {
  const res = await request(app).post('/api/v1/auth/login').send({ email: { $ne: null }, password: { $ne: null } });
  assert.equal(res.status, 400);
});

test('socket.io: unauthenticated connection is refused', async () => {
  const c = Client(url, { auth: {}, reconnection: false });
  const err = await new Promise((r) => c.once('connect_error', r));
  assert.match(err.message, /Authentication required/);
  c.close();
});

test('socket.io: real-time chat and notifications between two users', async () => {
  const a = Client(url, { auth: { token: studentToken }, reconnection: false });
  const b = Client(url, { auth: { token: student2Token }, reconnection: false });
  await Promise.all([new Promise((r) => a.once('connect', r)), new Promise((r) => b.once('connect', r))]);

  const received = new Promise((r) => b.once('receive_message', r));
  const ack = await new Promise((r) => a.emit('send_message', { to: student2Id, text: 'Hello, I have a question about the course.' }, r));
  assert.equal(ack.ok, true);
  const msg = await received;
  assert.equal(msg.text, 'Hello, I have a question about the course.');
  assert.equal(msg.sender, studentId);

  const bad = await new Promise((r) => a.emit('send_message', { to: student2Id, text: '   ' }, r));
  assert.equal(bad.ok, false);

  const history = await request(app).get(`/api/v1/messages/${studentId}`).set({ Authorization: `Bearer ${student2Token}` });
  assert.equal(history.body.messages.length, 1);

  const live = new Promise((r) => b.once('notification', r));
  await request(app).post('/api/v1/notifications').set({ Authorization: `Bearer ${adminToken}` }).send({ message: 'Live announcement' });
  assert.equal((await live).message, 'Live announcement');

  const presence = new Promise((r) => { const h = (p) => { if (!p.online.includes(studentId)) { b.off('presence', h); r(p); } }; b.on('presence', h); });
  a.close();
  assert.ok((await presence).online.includes(student2Id));
  b.close();
});

test('deleting a course removes its enrollments', async () => {
  const auth = { Authorization: `Bearer ${adminToken}` };
  assert.equal((await request(app).delete(`/api/v1/courses/${courseId}`).set(auth)).status, 200);
  assert.equal((await request(app).get('/api/v1/enrollments').set(auth)).body.count, 0);
});
