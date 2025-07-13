import request from 'supertest';
import app from '../app';
import db from '../db/db';
import { generateMockedUser } from '../utils/generateMockedUser';

describe('POST /v1/follow/new/:targetUserId', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}` });
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
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}` });
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
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}` });
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

describe('GET /v1/follow/followings/:requestId', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}` });
  let cookieA: string;
  let cookieB: string;
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
    cookieB = loginResponseB.headers['set-cookie'];

    //UserA follows UserB
    await db.follow.create({
      data: {
        requestByUserId: userAId,
        requestToUserId: userBId,
        isFollowing: 'TRUE',
      },
    });

    // UserB follows UserA
    await db.follow.create({
      data: {
        requestByUserId: userBId,
        requestToUserId: userAId,
        isFollowing: 'TRUE',
      },
    });
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get(`/v1/follow/followings/${userAId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error when target User id is invalid or not found', async () => {
    const response = await request(app)
      .get('/v1/follow/followings/invalidUserId')
      .set('Cookie', cookieA);

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  it('should return the followings of UserB when UserB tries to get it', async () => {
    const response = await request(app)
      .get(`/v1/follow/followings/${userBId}`)
      .set('Cookie', cookieB);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.followings.length).toBe(1);
  });

  it('should return the followings of UserB when UserA (his follower) tries to get it', async () => {
    const response = await request(app)
      .get(`/v1/follow/followings/${userBId}`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.followings.length).toBe(1);
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
    await request(app).post('/v1/auth/logout').set('Cookie', cookieB);

    await db.user.deleteMany({
      where: {
        username: {
          in: [userA.username, userB.username],
        },
      },
    });
  });
});

describe('GET /v1/follow/followers/:requestId', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}` });
  let cookieA: string;
  let cookieB: string;
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
    cookieB = loginResponseB.headers['set-cookie'];

    //UserA follows UserB
    await db.follow.create({
      data: {
        requestByUserId: userAId,
        requestToUserId: userBId,
        isFollowing: 'TRUE',
      },
    });

    //UserB follows UserA
    await db.follow.create({
      data: {
        requestByUserId: userBId,
        requestToUserId: userAId,
        isFollowing: 'TRUE',
      },
    });
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get(`/v1/follow/followers/${userAId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error when target User id is invalid or not found', async () => {
    const response = await request(app)
      .get('/v1/follow/followers/invalidUserId')
      .set('Cookie', cookieA);

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  it('should return the followers of UserB when UserB tries to get it', async () => {
    const response = await request(app)
      .get(`/v1/follow/followers/${userBId}`)
      .set('Cookie', cookieB);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.followers.length).toBe(1);
  });

  it('should return the followers of UserB when UserA (his follower) tries to get it', async () => {
    const response = await request(app)
      .get(`/v1/follow/followers/${userBId}`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.followers.length).toBe(1);
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
    await request(app).post('/v1/auth/logout').set('Cookie', cookieB);

    await db.user.deleteMany({
      where: {
        username: {
          in: [userA.username, userB.username],
        },
      },
    });
  });
});

describe('GET /v1/follow/notFollowing', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}` });
  let cookieA: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(userA);
    await request(app).post('/v1/auth/register').send(userB);

    const loginResponseA = await request(app)
      .post('/v1/auth/login')
      .send({ username: userA.username, password: userA.password });
    cookieA = loginResponseA.headers['set-cookie'];
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get('/v1/follow/notFollowing');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should return the array of people not followed by User', async () => {
    const response = await request(app)
      .get('/v1/follow/notFollowing')
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.usersNotFollowing.length).toBe(1);
  });

  afterAll(async () => {
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

describe('GET /v1/follow/pending/followRequests', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}` });
  let cookieA: string;
  let cookieB: string;
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
    cookieB = loginResponseB.headers['set-cookie'];

    // UserB sends follow request to UserA
    await db.follow.create({
      data: {
        requestByUserId: userBId,
        requestToUserId: userAId,
        isFollowing: 'PENDING',
      },
    });
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get(
      '/v1/follow/pending/followRequests',
    );

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should return the list of pending requests received to UserA', async () => {
    const response = await request(app)
      .get('/v1/follow/pending/followRequests')
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.pendingFollowRequests.length).toBe(1);
    expect(response.body.pendingFollowRequests[0].requestByUserId).toBe(
      userBId,
    );
    expect(response.body.success).toBeDefined();
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
    await request(app).post('/v1/auth/logout').set('Cookie', cookieB);

    await db.user.deleteMany({
      where: {
        username: {
          in: [userA.username, userB.username],
        },
      },
    });
  });
});

describe('GET /v1/follow/pending/followingRequests', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}` });
  let cookieA: string;
  let cookieB: string;
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
    cookieB = loginResponseB.headers['set-cookie'];

    // UserA sends follow request to UserB
    await db.follow.create({
      data: {
        requestByUserId: userAId,
        requestToUserId: userBId,
        isFollowing: 'PENDING',
      },
    });
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get(
      '/v1/follow/pending/followingRequests',
    );

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should return the list of pending requests sent by UserA', async () => {
    const response = await request(app)
      .get('/v1/follow/pending/followingRequests')
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.pendingFollowings.length).toBe(1);
    expect(response.body.pendingFollowings[0].requestToUserId).toBe(userBId);
    expect(response.body.success).toBeDefined();
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
    await request(app).post('/v1/auth/logout').set('Cookie', cookieB);

    await db.user.deleteMany({
      where: {
        username: {
          in: [userA.username, userB.username],
        },
      },
    });
  });
});
