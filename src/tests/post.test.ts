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
      'Failed to edit post as it does not exists!',
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
      'Failed to delete post as it does not exists!',
    );
  });

  it('should delete the post', async () => {
    const response = await request(app)
      .delete(`/v1/posts/${postId}`)
      .set('Cookie', cookie)

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
