import request from 'supertest';
import app from '../app';
import { generateMockedUser } from '../utils/generateMockedUser';
import db from '../db/db';

describe('POST /v1/auth/register', () => {
  const mockedUser = generateMockedUser();

  //   Creates a user (mocked)
  it('should create a new user with valid credentials', async () => {
    const response = await request(app)
      .post('/v1/auth/register')
      .send(mockedUser);

    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.success).toBe('User registered successfully!');
  });

  it('should throw  an error if a user tries to use an already existing username', async () => {
    const response = await request(app)
      .post('/v1/auth/register')
      .send(mockedUser);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('This username already exists!');
  });

  it('should throw  an error if a user tries to register with invalid or empty username', async () => {
    const response = await request(app)
      .post('/v1/auth/register')
      .send({ ...mockedUser, username: '' });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Username must be between 2 and 30 characters.',
    );
  });

  it('should throw  an error if a user tries to register with invalid or empty password', async () => {
    const response = await request(app)
      .post('/v1/auth/register')
      .send({ ...mockedUser, password: '' });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Password must be at least 6 characters long.',
    );
  });

  it('should throw  an error if a user tries to register with invalid or empty First Name', async () => {
    const response = await request(app)
      .post('/v1/auth/register')
      .send({ ...mockedUser, firstName: '' });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'First name must be between 2 and 30 characters.',
    );
  });

  it('should throw  an error if a user tries to register with invalid or empty Last Name', async () => {
    const response = await request(app)
      .post('/v1/auth/register')
      .send({ ...mockedUser, lastName: '' });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Last name must be between 2 and 30 characters.',
    );
  });

  // Deletes the mocked user
  afterAll(async () => {
    await db.user.deleteMany({
      where: {
        username: mockedUser.username,
      },
    });
  });
});

describe('POST /v1/auth/login', () => {
  const mockedUser = generateMockedUser();

  // Registers a mocked user
  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(mockedUser);
  });

  it('should return user data with correct credentials', async () => {
    let cookie: string;

    const response = await request(app)
      .post('/v1/auth/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    cookie = response.headers['set-cookie'][0];

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(cookie).toMatch(/token=/);
    expect(response.body.success).toBe('User logged in successfully!');
  });

  it('should throw an error with wrong username', async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ username: 'WrongUsername', password: mockedUser.password });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('This username does not exists!');
  });

  it('should throw an error with wrong password', async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ username: mockedUser.username, password: 'wrongpassword' });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Incorrect password!');
  });

  it('should throw an error with blank username', async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ password: mockedUser.password });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Username must be between 2 and 30 characters.',
    );
  });

  it('should throw an error with blank password', async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ username: mockedUser.username });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Password must be at least 6 characters long.',
    );
  });

  // Deletes the registered mocked user
  afterAll(async () => {
    await db.user.deleteMany({
      where: {
        username: mockedUser.username,
      },
    });
  });
});
