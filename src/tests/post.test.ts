import request from 'supertest';
import { generateMockedUser } from '../utils/generateMockedUser';
import app from '../app';
import db from '../db/db';

describe('POST /v1/posts/new', () => {
  const mockedUser = generateMockedUser();
  let cookie: string;
  let mockedUserId: string;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/v1/auth/register')
      .send(mockedUser);
    mockedUserId = registerResponse.body.user.id;

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    cookie = loginResponse.headers['set-cookie'];
  });

  it('should throw an error if http only cookie is not found', async () => {
    const response = await request(app).post('/v1/posts/new').send({
      content: 'this is first post',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should create a post', async () => {
    const response = await request(app)
      .post('/v1/posts/new')
      .send({
        content: 'this is first successful post',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe('Post created successfully!');
    expect(response.body.post).toBeDefined();
  });

  it('should throw an error with invalid content', async () => {
    const response = await request(app)
      .post('/v1/posts/new')
      .send({
        content: '',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Content must be between 1 and 2000 characters.',
    );
  });

  afterAll(async () => {
    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.post.deleteMany({
      where: {
        userId: mockedUserId,
      },
    });

    await db.user.deleteMany({
      where: {
        username: mockedUser.username,
      },
    });
  });
});

describe('PUT /v1/posts/:postId', () => {
  const mockedUser = generateMockedUser();
  let cookie: string;
  let mockedUserId: string;
  let postId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(mockedUser);

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    mockedUserId = loginResponse.body.user.id;

    cookie = loginResponse.headers['set-cookie'];

    const post = await db.post.create({
      data: {
        userId: mockedUserId,
        content: 'this is mocked post content',
      },
    });

    postId = post.id;
  });

  it("should edit post's content", async () => {
    const response = await request(app)
      .put(`/v1/posts/${postId}`)
      .send({
        content: 'This is the edited content',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.post).toBeDefined();
    expect(response.body.success).toBe('Post edited successfully!');
    expect(response.body.post.content).toBe('This is the edited content');
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).put(`/v1/posts/${postId}`).send({
      content: 'This is the edited content',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error if the postId is invalid', async () => {
    const response = await request(app)
      .put(`/v1/posts/demopost`)
      .send({
        content: 'This is the edited content',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      'Failed to edit post as it does not exist!',
    );
  });

  afterAll(async () => {
    await db.post.deleteMany({
      where: {
        userId: mockedUserId,
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.user.deleteMany({
      where: {
        username: mockedUser.username,
      },
    });
  });
});

describe('DELETE /v1/posts/:postId', () => {
  const mockedUser = generateMockedUser();
  let cookie: string;
  let mockedUserId: string;
  let postId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(mockedUser);

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    mockedUserId = loginResponse.body.user.id;

    cookie = loginResponse.headers['set-cookie'];

    const post = await db.post.create({
      data: {
        userId: mockedUserId,
        content: 'this is mocked post content',
      },
    });

    postId = post.id;
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).delete(`/v1/posts/${postId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error if the postId is invalid', async () => {
    const response = await request(app)
      .delete(`/v1/posts/demopost`)
      .set('Cookie', cookie);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      'Failed to delete post as it does not exist!',
    );
  });

  it('should delete the post', async () => {
    const response = await request(app)
      .delete(`/v1/posts/${postId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe('Post deleted successfully!');
  });

  afterAll(async () => {
    await db.post.deleteMany({
      where: {
        userId: mockedUserId,
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.user.deleteMany({
      where: {
        username: mockedUser.username,
      },
    });
  });
});

describe('GET /v1/posts/myposts', () => {
  const mockedUser = generateMockedUser();
  let cookie: string;
  let mockedUserId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(mockedUser);

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    mockedUserId = loginResponse.body.user.id;

    cookie = loginResponse.headers['set-cookie'];

    await db.post.create({
      data: {
        userId: mockedUserId,
        content: 'this is mocked post content',
      },
    });
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get(`/v1/posts/myposts`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should return all posts of the user', async () => {
    const response = await request(app)
      .get(`/v1/posts/myposts`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.posts.length).toBe(1);
  });

  afterAll(async () => {
    await db.post.deleteMany({
      where: {
        userId: mockedUserId,
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.user.deleteMany({
      where: {
        username: mockedUser.username,
      },
    });
  });
});

describe('POST /v1/posts/like/:postId', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `MockedUserB${Date.now()}` });
  let postId: string;
  let cookieA: string;
  let userAId: string;
  let cookieB: string;

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

    cookieB = loginResponseB.headers['set-cookie'];

    const post = await db.post.create({
      data: {
        userId: userAId,
        content: 'this is mocked post content',
      },
    });

    postId = post.id;
  });

  it('should like the post', async () => {
    const responseA = await request(app)
      .post(`/v1/posts/like/${postId}`)
      .set('Cookie', cookieA);

    const responseB = await request(app)
      .post(`/v1/posts/like/${postId}`)
      .set('Cookie', cookieB);

    expect(responseA.status).toBe(200);
    expect(responseA.body.success).toBeDefined();
    expect(responseA.body.post).toBeDefined();

    expect(responseB.status).toBe(200);
    expect(responseB.body.success).toBeDefined();
    expect(responseB.body.post.likes.length).toBe(2);
  });

  it('should unlike the post', async () => {
    const response = await request(app)
      .post(`/v1/posts/like/${postId}`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.post.likes.length).toBe(1);
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).post(`/v1/posts/like/${postId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error when postId is invalid', async () => {
    const response = await request(app)
      .post(`/v1/posts/like/demopost`)
      .set('Cookie', cookieA);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Post not found!');
  });

  afterAll(async () => {
    await db.post.deleteMany({
      where: {
        userId: userAId,
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

describe('GET /v1/posts/feed', () => {
  const userA = generateMockedUser();
  const userB = generateMockedUser({ username: `adadadad${Date.now()}` });
  let cookieA: string;
  let userBId: string;
  let cookieB: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(userA);

    await request(app).post('/v1/auth/register').send(userB);

    const loginResponseA = await request(app)
      .post('/v1/auth/login')
      .send({ username: userA.username, password: userA.password });

    cookieA = loginResponseA.headers['set-cookie'];

    const loginResponseB = await request(app)
      .post('/v1/auth/login')
      .send({ username: userB.username, password: userB.password });

    userBId = loginResponseB.body.user.id;
    cookieB = loginResponseB.headers['set-cookie'];

    // Posts created by UserB
    await db.post.createMany({
      data: [
        {
          userId: userBId,
          content: 'this is mocked post content',
        },
        {
          userId: userBId,
          content: 'this is second mocked post content',
        },
      ],
    });
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get('/v1/posts/feed');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should return paginated data when provided page and limit', async () => {
    const response = await request(app)
      .get('/v1/posts/feed?page=2&limit=1')
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
  });

  it('should return data with default pagination without page and limit provided as query', async () => {
    const response = await request(app)
      .get('/v1/posts/feed')
      .set('Cookie', cookieA);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
  });

  afterAll(async () => {
    await db.post.deleteMany({
      where: {
        userId: userBId,
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

describe('GET /v1/posts/post/:postId', () => {
  const user = generateMockedUser();
  let cookie: string;
  let userId: string;
  let postId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(user);

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: user.username, password: user.password });

    userId = loginResponse.body.user.id;

    cookie = loginResponse.headers['set-cookie'];

    const post = await db.post.create({
      data: {
        userId: userId,
        content: 'this is mocked post content',
      },
    });

    postId = post.id;
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get(`/v1/posts/post${postId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error when http postId is invalid', async () => {
    const response = await request(app)
      .get('/v1/posts/post/invalidpostId')
      .set('Cookie', cookie);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Post not found!');
  });

  it('should return post with valid postId', async () => {
    const response = await request(app)
      .get(`/v1/posts/post/${postId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
  });

  afterAll(async () => {
    await db.post.deleteMany({
      where: {
        userId,
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.user.deleteMany({
      where: {
        username: user.username,
      },
    });
  });
});
