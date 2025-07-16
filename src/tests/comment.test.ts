import request from 'supertest';
import app from '../app';
import { generateMockedUser } from '../utils/generateMockedUser';
import db from '../db/db';
import { createNewComment } from '../db/queries/commentQueries';

describe('POST /v1/comments', () => {
  const user = generateMockedUser();
  let cookie: string;
  let postId: string;
  let userId: string;
  let commentId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(user);

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: user.username, password: user.password });
    cookie = loginResponse.headers['set-cookie'];

    userId = loginResponse.body.user.id;

    const post = await db.post.create({
      data: {
        content: 'this is mocked post',
        userId,
      },
    });

    postId = post.id;
  });

  it('should create a comment on post', async () => {
    const response = await request(app)
      .post('/v1/comments')
      .set('Cookie', cookie)
      .send({
        postId,
        content: 'This is the mocked comment',
      });

    commentId = response.body.comment.id;

    expect(response.status).toBe(201);
    expect(response.body.comment).toBeDefined();
    expect(response.body.success).toBeDefined();
  });

  it('should create a comment as a reply to other comment', async () => {
    const response = await request(app)
      .post('/v1/comments')
      .set('Cookie', cookie)
      .send({
        postId,
        replyToCommentId: commentId,
        content: 'This is the reply of a comment',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBeDefined();
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).post('/v1/comments');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error if content is invalid', async () => {
    const response = await request(app)
      .post('/v1/comments')
      .set('Cookie', cookie)
      .send({
        postId,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Comment must be between 1 and 200 characters.',
    );
  });

  it('should throw an error if postId is invalid', async () => {
    const response = await request(app)
      .post('/v1/comments')
      .set('Cookie', cookie)
      .send({
        content: 'This is the mocked content',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Post Id is missing. It cannot be empty!');
  });

  afterAll(async () => {
    await db.comment.deleteMany({
      where: {
        userId,
      },
    });

    await db.post.deleteMany({
      where: {
        userId,
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.user.deleteMany({
      where: {
        id: userId,
      },
    });
  });
});

describe('PUT /v1/comments/:commentId', () => {
  const user = generateMockedUser();
  let cookie: string;
  let postId: string;
  let userId: string;
  let commentId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(user);

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: user.username, password: user.password });
    cookie = loginResponse.headers['set-cookie'];

    userId = loginResponse.body.user.id;

    const post = await db.post.create({
      data: {
        content: 'this is mocked post',
        userId,
      },
    });

    postId = post.id;

    const comment = await db.comment.create({
      data: {
        postId,
        userId,
        content: 'This is a mocked comment',
      },
    });

    commentId = comment.id;
  });

  it("should edit comment's content", async () => {
    const response = await request(app)
      .put(`/v1/comments/${commentId}`)
      .send({
        content: 'This is the edited content',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.comment).toBeDefined();
    expect(response.body.success).toBeDefined();
    expect(response.body.comment.content).toBe('This is the edited content');
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).put(`/v1/comments/${commentId}`).send({
      content: 'This is the edited content',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error if the content is invalid', async () => {
    const response = await request(app)
      .put(`/v1/comments/democomment`)
      .send({
        content: '',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Comment must be between 1 and 200 characters.',
    );
  });

  it('should throw an error if the commentId is invalid', async () => {
    const response = await request(app)
      .put(`/v1/comments/democomment`)
      .send({
        content: 'This is the edited content',
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      'Failed to edit comment as it does not exist!',
    );
  });

  afterAll(async () => {
    await db.comment.deleteMany({
      where: {
        userId,
      },
    });

    await db.post.deleteMany({
      where: {
        userId,
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.user.deleteMany({
      where: {
        id: userId,
      },
    });
  });
});

describe('DELETE /v1/comments/:commentId', () => {
  const user = generateMockedUser();
  let cookie: string;
  let postId: string;
  let userId: string;
  let commentId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(user);

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: user.username, password: user.password });
    cookie = loginResponse.headers['set-cookie'];

    userId = loginResponse.body.user.id;

    const post = await db.post.create({
      data: {
        content: 'this is mocked post',
        userId,
      },
    });

    postId = post.id;

    const comment = await db.comment.create({
      data: {
        postId,
        userId,
        content: 'This is a mocked comment',
      },
    });

    commentId = comment.id;
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).delete(`/v1/comments/${commentId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error if the commentId is invalid', async () => {
    const response = await request(app)
      .delete(`/v1/comments/democomment`)
      .set('Cookie', cookie);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      'Failed to delete comment as it does not exist!',
    );
  });

  it('should delete the comment', async () => {
    const response = await request(app)
      .delete(`/v1/comments/${commentId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe('Comment deleted successfully!');
  });

  afterAll(async () => {
    await db.comment.deleteMany({
      where: {
        userId,
      },
    });

    await db.post.deleteMany({
      where: {
        userId,
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.user.deleteMany({
      where: {
        id: userId,
      },
    });
  });
});

describe('GET /v1/comments/post/:postId', () => {
  const user = generateMockedUser();
  let cookie: string;
  let postId: string;
  let userId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(user);

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: user.username, password: user.password });
    cookie = loginResponse.headers['set-cookie'];

    userId = loginResponse.body.user.id;

    const post = await db.post.create({
      data: {
        content: 'this is mocked post',
        userId,
      },
    });

    postId = post.id;

    await db.comment.create({
      data: {
        postId,
        userId,
        content: 'This is a mocked comment',
      },
    });
  });

  it('should return all direct comments made in the post', async () => {
    const response = await request(app)
      .get(`/v1/comments/post/${postId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.comments).toBeDefined();
    expect(response.body.success).toBeDefined();
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get(`/v1/comments/post/${postId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error if the postId is invalid', async () => {
    const response = await request(app)
      .get(`/v1/comments/post/demopost`)
      .set('Cookie', cookie);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      'Failed to get comments as Post id is invalid!',
    );
  });

  afterAll(async () => {
    await db.comment.deleteMany({
      where: {
        userId,
      },
    });

    await db.post.deleteMany({
      where: {
        userId,
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.user.deleteMany({
      where: {
        id: userId,
      },
    });
  });
});

describe('GET /v1/comments/comment/:commentId', () => {
  const user = generateMockedUser();
  let cookie: string;
  let postId: string;
  let userId: string;
  let commentId: string;

  beforeAll(async () => {
    await request(app).post('/v1/auth/register').send(user);

    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({ username: user.username, password: user.password });
    cookie = loginResponse.headers['set-cookie'];

    userId = loginResponse.body.user.id;

    const post = await db.post.create({
      data: {
        content: 'this is mocked post',
        userId,
      },
    });

    postId = post.id;

    const comment = await db.comment.create({
      data: {
        postId,
        userId,
        content: 'This is a mocked comment',
      },
    });

    commentId = comment.id;
  });

  it('should throw an error when http only cookie is not found', async () => {
    const response = await request(app).get(
      `/v1/comments/comment/${commentId}`,
    );

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'Unauthorized Action: Auth token is missing!',
    );
  });

  it('should throw an error if the postId is invalid', async () => {
    const response = await request(app)
      .get(`/v1/comments/comment/democomment`)
      .set('Cookie', cookie);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      'Failed to get comments as Comment id is invalid!',
    );
  });

  it('should return the sub-comments created below the main comment', async () => {
    const response = await request(app)
      .get(`/v1/comments/comment/${commentId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeDefined();
    expect(response.body.subComments).toBeDefined();
  });

  afterAll(async () => {
    await db.subComment.deleteMany({
      where: {
        parentCommentId: commentId,
      },
    });

    await db.comment.deleteMany({
      where: {
        userId,
      },
    });

    await db.post.deleteMany({
      where: {
        userId,
      },
    });

    await request(app).post('/v1/auth/logout').set('Cookie', cookie);

    await db.user.deleteMany({
      where: {
        id: userId,
      },
    });
  });
});
