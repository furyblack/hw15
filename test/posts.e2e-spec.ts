import { initSettings } from './helpers/init-settings';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostsTestManager } from './helpers/posts-test-manager';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { CreatePostDto } from '../src/moduls/bloggers-platform/posts/dto/create-post.dto';
import { CreateBlogDto } from '../src/moduls/bloggers-platform/blogs/dto/create-blog.dto';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import request from 'supertest';

describe('posts', () => {
  let app: INestApplication;
  let blogTestManager: BlogsTestManager;
  let postTestManager: PostsTestManager;
  let accessToken: string;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => {
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: 'access-token-secret',
          signOptions: { expiresIn: '2s' },
        }),
      );
    });

    app = result.app;
    blogTestManager = result.blogTestManager;
    postTestManager = result.postTestManager;

    // Получаем токен для тестов
    const authResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'testuser', password: 'password' });
    accessToken = authResponse.body.accessToken;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create new post', async () => {
    const blogBody: CreateBlogDto = {
      name: 'Test Blog',
      description: 'Test Description',
      websiteUrl: 'https://test.com',
    };
    const createdBlog = await blogTestManager.createBlog(blogBody);

    const postBody: CreatePostDto = {
      title: 'Test Post',
      shortDescription: 'Test Short Description',
      content: 'Test Content',
      blogId: createdBlog.id,
    };

    const createdPost = await postTestManager.createPost(
      postBody,
      HttpStatus.CREATED,
      accessToken,
    );

    expect(createdPost).toEqual({
      id: expect.any(String),
      title: postBody.title,
      shortDescription: postBody.shortDescription,
      content: postBody.content,
      blogId: createdBlog.id,
      blogName: createdBlog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    });
  });

  it('should return 401 when creating post without auth', async () => {
    const blogBody: CreateBlogDto = {
      name: 'Test Blog',
      description: 'Test Description',
      websiteUrl: 'https://test.com',
    };
    const createdBlog = await blogTestManager.createBlog(blogBody);

    const postBody: CreatePostDto = {
      title: 'Test Post',
      shortDescription: 'Test Short Description',
      content: 'Test Content',
      blogId: createdBlog.id,
    };

    await request(app.getHttpServer())
      .post('/api/posts')
      .send(postBody)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  // Аналогично обновляем другие тесты...
});
