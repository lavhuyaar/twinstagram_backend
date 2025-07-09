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
