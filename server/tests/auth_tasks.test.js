const request = require('supertest');
process.env.NODE_ENV = 'test';
const { app, connectDB, disconnectDB } = require('../index');

describe('Auth and Tasks API', () => {
  let token;
  beforeAll(async () => {
    await connectDB();
  });
  afterAll(async () => {
    await disconnectDB();
  });

  test('register -> login', async () => {
    const username = 'user1';
    const password = 'pass1';
    const reg = await request(app).post('/register').send({ username, password });
    expect(reg.statusCode).toBe(200);
    const login = await request(app).post('/login').send({ username, password });
    expect(login.body.token).toBeDefined();
    token = login.body.token;
  });

  test('CRUD tasks', async () => {
    // Create
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', 'Bearer ' + token)
      .send({ text: 'Test Task' });
    expect(createRes.body._id).toBeDefined();
    const id = createRes.body._id;

    // Read
    const listRes = await request(app)
      .get('/tasks')
      .set('Authorization', 'Bearer ' + token);
    expect(listRes.body.length).toBeGreaterThan(0);

    // Update
    const upd = await request(app)
      .put('/tasks/' + id)
      .set('Authorization', 'Bearer ' + token)
      .send({ text: 'Updated Task' });
    expect(upd.body.text).toBe('Updated Task');

    // Delete
    const del = await request(app)
      .delete('/tasks/' + id)
      .set('Authorization', 'Bearer ' + token);
    expect(del.body.success).toBe(true);
  });
});
