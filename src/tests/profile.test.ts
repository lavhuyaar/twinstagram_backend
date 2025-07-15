import request from 'supertest';
import path from 'path';
import app from '../app';
import { generateMockedUser } from '../utils/generateMockedUser';
import db from '../db/db';

describe('PUT /v1/profile', () => {
  const mockedUser = generateMockedUser();
  let cookie: string;
  let userId: string;

  beforeAll(async () => {
    // Registers new user (mocked)
    await request(app).post('/v1/auth/register').send(mockedUser);

    // Logs in the mocked user
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    userId = loginResponse.body.user.id;

    // HTTP only cookie
    cookie = loginResponse.headers['set-cookie'];
  });

  it('should edit the existing profile', async () => {
    const response = await request(app)
      .put('/v1/profile')
      .send({
        username: 'EditedName',
        firstName: 'Edited',
        lastName: 'Name',
        profileType: 'PUBLIC',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe('Profile updated successfully!');
    expect(response.body.user).toBeDefined();
  });

  it('should throw an error if user does not send http cookie', async () => {
    const response = await request(app).put('/v1/profile').send({
      username: 'EditedName',
      firstName: 'Edited',
      lastName: 'Name',
      profileType: 'PUBLIC',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error when username is invalid', async () => {
    const response = await request(app)
      .put('/v1/profile')
      .send({
        firstName: 'Edited',
        lastName: 'Name',
        profileType: 'PRIVATE',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Username must be between 2 and 30 characters.',
    );
  });

  it('should throw an error when firstName is invalid', async () => {
    const response = await request(app)
      .put('/v1/profile')
      .send({
        username: 'EditedName',
        lastName: 'Name',
        profileType: 'PRIVATE',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'First name must be between 2 and 30 characters.',
    );
  });

  it('should throw an error when lastName is invalid', async () => {
    const response = await request(app)
      .put('/v1/profile')
      .send({
        username: 'EditedName',
        firstName: 'Edited',
        profileType: 'PUBLIC',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Last name must be between 2 and 30 characters.',
    );
  });

  it('should throw an error when profileType is invalid', async () => {
    const response = await request(app)
      .put('/v1/profile')
      .send({
        username: 'EditedName',
        firstName: 'Edited',
        lastName: 'Name',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Profile type must be either public or private.',
    );
  });

  afterAll(async () => {
    await request(app).get('/v1/auth/logout').set('Cookie', cookie);

    await db.user.delete({
      where: {
        id: userId,
      },
    });
  });
});

describe('GET /v1/profile/:targetUserId', () => {
  const user = generateMockedUser();
  let cookie: string;
  let userId: string;

  beforeAll(async () => {
    // Registers new user (mocked)
    await request(app).post('/v1/auth/register').send(user);

    // Logs in the mocked user
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: user.username, password: user.password });

    userId = loginResponse.body.user.id;

    // HTTP only cookie
    cookie = loginResponse.headers['set-cookie'];
  });

  it('should throw an error if http only cookie is not found', async () => {
    const response = await request(app).get(`/v1/profile/${userId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error if targetUserId is invalid', async () => {
    const response = await request(app)
      .get('/v1/profile/invaliduserid')
      .set('Cookie', cookie);

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  it('should return profile details', async () => {
    const response = await request(app)
      .get(`/v1/profile/${userId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.profile).toBeDefined();
  });

  afterAll(async () => {
    await request(app).get('/v1/auth/logout').set('Cookie', cookie);

    await db.user.delete({
      where: {
        id: userId,
      },
    });
  });
});

describe('PUT /v1/profile/type/toggle', () => {
  const user = generateMockedUser();
  let cookie: string;
  let userId: string;

  beforeAll(async () => {
    // Registers new user (mocked)
    await request(app).post('/v1/auth/register').send(user);

    // Logs in the mocked user
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: user.username, password: user.password });

    userId = loginResponse.body.user.id;

    // HTTP only cookie
    cookie = loginResponse.headers['set-cookie'];
  });

  it('should throw an error if http only cookie is not found', async () => {
    const response = await request(app).put('/v1/profile/profileType/toggle');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error if profileType param is not found', async () => {
    const response = await request(app)
      .put('/v1/profile/type/toggle')
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should change the profile type of user to private', async () => {
    const response = await request(app)
      .put('/v1/profile/type/toggle?profileType=PRIVATE')
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.user.profileType).toBe('PRIVATE');
  });

  it('should change the profile type of user to public', async () => {
    const response = await request(app)
      .put('/v1/profile/type/toggle?profileType=PUBLIC')
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.user.profileType).toBe('PUBLIC');
  });

  afterAll(async () => {
    await request(app).get('/v1/auth/logout').set('Cookie', cookie);

    await db.user.delete({
      where: {
        id: userId,
      },
    });
  });
});
