import request from 'supertest';
import { generateMockedUser } from '../utils/generateMockedUser';
import app from '../app';
import db from '../db/db';

describe('POST /v1/follow/new/:targetUserId', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}`});
  let cookieA: string;
  let userAId: string;
  let userBId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(userA);

    await request(app).post('/v1/auth/register').send(userB);

    const loginResponseA = await request(app)
      .post('/v1/auth/login')
      .send({ username: userA.username, password: userA.password });

    userAId = loginResponseA.body.user.id;
    cookieA = loginResponseA.headers['set-cookie'];

    const loginResponseB = await request(app)
      .post('/v1/auth/login')
      .send({ username: userB.username, password: userB.password });

    userBId = loginResponseB.body.user.id;
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).post(`/v1/follow/new/${userBId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error when targetUserId is invalid', async () => {
    const response = await request(app)
      .post('/v1/follow/new/invaliduserid')
      .set('Cookie', cookieA);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      'Failed to send follow request as target user is not found!',
    );
  });

  it('should follow the userB', async () => {
    const response = await request(app)
      .post(`/v1/follow/new/${userBId}`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(201);
    expect(response.body.request).toBeDefined();
    expect(response.body.success).toBeDefined();
  });

  it('should fail creating another follow request to userB while a request is either pending or fulfilled', async () => {
    const response = await request(app)
      .post(`/v1/follow/new/${userBId}`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('This follow request already exists!');
  });

  it('should throw an error when user tries to request to self', async () => {
    const response = await request(app)
      .post(`/v1/follow/new/${userAId}`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Cannot send follow request to self!');
  });

  afterAll(async () => {
    await db.follow.deleteMany({
      where: {
        OR: [
          {
            requestByUserId: {
              in: [userAId, userBId],
            },
          },
          {
            requestToUserId: {
              in: [userAId, userBId],
            },
          },
        ],
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookieA);

    await db.user.deleteMany({
      where: {
        username: {
          in: [userA.username, userB.username],
        },
      },
    });
  });
});

describe('PUT /v1/follow/request/:requestId/accept', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}`});
  let cookieA: string;
  let userAId: string;
  let userBId: string;
  let followRequestId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(userA);

    await request(app).post('/v1/auth/register').send(userB);

    const loginResponseA = await request(app)
      .post('/v1/auth/login')
      .send({ username: userA.username, password: userA.password });

    userAId = loginResponseA.body.user.id;
    cookieA = loginResponseA.headers['set-cookie'];

    const loginResponseB = await request(app)
      .post('/v1/auth/login')
      .send({ username: userB.username, password: userB.password });

    userBId = loginResponseB.body.user.id;

    const followRequest = await db.follow.create({
      data: {
        requestByUserId: userBId,
        requestToUserId: userAId,
        isFollowing: 'PENDING',
      },
    });

    followRequestId = followRequest.id;
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).put(
      `/v1/follow/request/${followRequestId}/accept`,
    );

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error when followRequestId is invalid', async () => {
    const response = await request(app)
      .put(`/v1/follow/request/adadadada/accept`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Cannot find follow request!');
  });

  it('should accept the follow request', async () => {
    const response = await request(app)
      .put(`/v1/follow/request/${followRequestId}/accept`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe('Follow request accepted!');
  });

  it('should throw an error after the follow request is already accepted', async () => {
    const response = await request(app)
      .put(`/v1/follow/request/${followRequestId}/accept`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      'Follow request has already been accepted!',
    );
  });

  afterAll(async () => {
    await db.follow.deleteMany({
      where: {
        OR: [
          {
            requestByUserId: {
              in: [userAId, userBId],
            },
          },
          {
            requestToUserId: {
              in: [userAId, userBId],
            },
          },
        ],
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookieA);

    await db.user.deleteMany({
      where: {
        username: {
          in: [userA.username, userB.username],
        },
      },
    });
  });
});

describe('DELETE /v1/follow/:requestId', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username:`MockedUserB${Date.now()}` });
  let cookieA: string;
  let userAId: string;
  let userBId: string;
  let followRequestId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(userA);

    await request(app).post('/v1/auth/register').send(userB);

    const loginResponseA = await request(app)
      .post('/v1/auth/login')
      .send({ username: userA.username, password: userA.password });

    userAId = loginResponseA.body.user.id;
    cookieA = loginResponseA.headers['set-cookie'];

    const loginResponseB = await request(app)
      .post('/v1/auth/login')
      .send({ username: userB.username, password: userB.password });

    userBId = loginResponseB.body.user.id;

    const followRequest = await db.follow.create({
      data: {
        requestByUserId: userBId,
        requestToUserId: userAId,
        isFollowing: 'PENDING',
      },
    });

    followRequestId = followRequest.id;
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).delete(`/v1/follow/${followRequestId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error when followRequestId is invalid', async () => {
    const response = await request(app)
      .delete(`/v1/follow/adadadada`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Cannot find follow request!');
  });

  it('should delete the follow request', async () => {
    const response = await request(app)
      .delete(`/v1/follow/${followRequestId}`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
  });

  it('should throw an error after the follow request is already deleted', async () => {
    const response = await request(app)
      .delete(`/v1/follow/${followRequestId}`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Cannot find follow request!');
  });

  afterAll(async () => {
    await db.follow.deleteMany({
      where: {
        OR: [
          {
            requestByUserId: {
              in: [userAId, userBId],
            },
          },
          {
            requestToUserId: {
              in: [userAId, userBId],
            },
          },
        ],
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookieA);

    await db.user.deleteMany({
      where: {
        username: {
          in: [userA.username, userB.username],
        },
      },
    });
  });
});
