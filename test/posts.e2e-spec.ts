import { initSettings } from './helpers/init-settings';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostsTestManager } from './helpers/posts-test-manager';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import {
  CreatePostDto,
  UpdatePostDto,
} from '../src/moduls/bloggers-platform/posts/dto/create-post.dto';
import { CreateBlogDto } from '../src/moduls/bloggers-platform/blogs/dto/create-blog.dto';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import request from 'supertest';
import { PaginatedViewDto } from '../src/core/dto/base.paginated.view-dto';
import { PostsViewDto } from '../src/moduls/bloggers-platform/posts/api/view-dto/posts.view-dto';

describe('posts', () => {
  let app: INestApplication;
  let blogTestManager: BlogsTestManager;
  let postTestManager: PostsTestManager;
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create new post', async () => {
    //создаем блог, blogId которого будем использовать
    const blogBody: CreateBlogDto = {
      name: 'string',
      description: 'string',
      websiteUrl:
        'https://p.7H1rV.DE-7hHrXZ9-ecNVheetttF66YKCJ_-gjJz1zDp0fQ6Yk1RCgUP00kPHQQ-ZuYOna0386PCmCt6VFpYShwgjX',
    };
    const createdBlog = await blogTestManager.createBlog(blogBody);
    // создаем пост с привязкой к блогу
    const postBody: CreatePostDto = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: createdBlog.id,
    };
    const createdPost = await postTestManager.createPost(postBody);
    // проверяем, что пост создался
    expect(createdPost).toBeDefined();
    expect(createdPost.title).toBe(postBody.title);
    expect(createdPost.shortDescription).toBe(postBody.shortDescription);
    expect(createdPost.content).toBe(postBody.content);
    expect(createdPost.blogId).toBe(createdBlog.id);
  });
  it('should get all posts with paging', async () => {
    const posts = await postTestManager.createSeveralPosts(12);
    const { body: responseBody } = (await request(app.getHttpServer())
      .get(`/api/posts?pageNumber=2&sortDirection=asc`)
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<PostsViewDto> };

    expect(responseBody.totalCount).toBe(12);
    expect(responseBody.items).toHaveLength(2);
    expect(responseBody.pagesCount).toBe(2);
    expect(responseBody.items[1]).toEqual(posts[posts.length - 1]);
  });
  it('should get post by id', async () => {
    //создаем блог для которого создадим пост
    const blogBody: CreateBlogDto = {
      name: 'string',
      description: 'string',
      websiteUrl:
        'https://p.7H1rV.DE-7hHrXZ9-ecNVheetttF66YKCJ_-gjJz1zDp0fQ6Yk1RCgUP00kPHQQ-ZuYOna0386PCmCt6VFpYShwgjX',
    };
    const createdBlog = await blogTestManager.createBlog(blogBody);
    //создаем пост, который получим
    const postBody: CreatePostDto = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: createdBlog.id,
    };
    const createdPost = await postTestManager.createPost(postBody);

    //получаем пост по id
    const { body: responseBody } = await request(app.getHttpServer())
      .get(`/api/posts/${createdPost.id}`)
      .expect(HttpStatus.OK);
    expect(responseBody.blogId).toBe(createdPost.blogId);
    expect(responseBody.id).toBe(createdPost.id);
    expect(responseBody.title).toBe(postBody.title);
    expect(responseBody.shortDescription).toBe(postBody.shortDescription);
    expect(responseBody.content).toBe(postBody.content);
  });
  it('should delete post by id', async () => {
    //создаем блог для которого создадим пост
    const blogBody: CreateBlogDto = {
      name: 'string',
      description: 'string',
      websiteUrl:
        'https://p.7H1rV.DE-7hHrXZ9-ecNVheetttF66YKCJ_-gjJz1zDp0fQ6Yk1RCgUP00kPHQQ-ZuYOna0386PCmCt6VFpYShwgjX',
    };
    const createdBlog = await blogTestManager.createBlog(blogBody);
    //создаем пост, который будем удалять
    const postBody: CreatePostDto = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: createdBlog.id,
    };
    const createdPost = await postTestManager.createPost(postBody);
    await postTestManager.deletePost(createdPost.id);

    const server = app.getHttpServer();
    await request(server)
      .get(`/api/posts/${createdPost.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
  it('should update post by id', async () => {
    //создаем блог для которого создадим пост
    const blogBody: CreateBlogDto = {
      name: 'string',
      description: 'string',
      websiteUrl:
        'https://p.7H1rV.DE-7hHrXZ9-ecNVheetttF66YKCJ_-gjJz1zDp0fQ6Yk1RCgUP00kPHQQ-ZuYOna0386PCmCt6VFpYShwgjX',
    };
    const createdBlog = await blogTestManager.createBlog(blogBody);
    //создаем пост, который будем обновлять
    const postBody: CreatePostDto = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: createdBlog.id,
    };
    const createdPost = await postTestManager.createPost(postBody);
    //подготавливаем данные для обновления поста
    const updatedBody: UpdatePostDto = {
      title: 'Updated post title',
      shortDescription: 'Updated post shortDescription',
      content: 'Updated post content',
      blogId: createdBlog.id,
      blogName: createdBlog.name,
    };
    //обновляем пост
    await postTestManager.updatePost(createdPost.id, updatedBody);

    //получаем обновленный пост и проверяем что данные обновились
    const { body: responseBody } = await request(app.getHttpServer())
      .get(`/api/posts/${createdPost.id}`)
      .expect(HttpStatus.OK);

    expect(responseBody.blogId).toBe(updatedBody.blogId);
    expect(responseBody.id).toBe(createdPost.id);
    expect(responseBody.title).toBe(updatedBody.title);
    expect(responseBody.shortDescription).toBe(updatedBody.shortDescription);
    expect(responseBody.content).toBe(updatedBody.content);
  });
});
