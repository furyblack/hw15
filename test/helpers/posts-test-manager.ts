import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PostsViewDto } from '../../src/moduls/bloggers-platform/posts/api/view-dto/posts.view-dto';
import {
  CreatePostDto,
  UpdatePostDto,
} from '../../src/moduls/bloggers-platform/posts/dto/create-post.dto';
import { delay } from './delay';
import { CreateBlogDto } from '../../src/moduls/bloggers-platform/blogs/dto/create-blog.dto';
import { BlogsTestManager } from './blogs-test-manager';

export class PostsTestManager {
  constructor(
    private app: INestApplication,
    private readonly blogTestManager: BlogsTestManager,
  ) {}

  private getAccessToken(): string {
    // Здесь должна быть логика получения токена
    // Например, через AuthTestManager
    return 'valid-access-token';
  }

  async createPost(
    createModel: CreatePostDto,
    statusCode: number = HttpStatus.CREATED,
    token?: string,
  ): Promise<PostsViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/api/posts')
      .set('Authorization', `Bearer ${token || this.getAccessToken()}`)
      .send(createModel)
      .expect(statusCode);
    return response.body;
  }

  async createSeveralPosts(
    count: number,
    blogId?: string,
    token?: string,
  ): Promise<PostsViewDto[]> {
    if (!blogId) {
      const blogBody: CreateBlogDto = {
        name: 'Default Blog',
        description: 'Default Description',
        websiteUrl: 'https://example.com',
      };
      const createdBlog = await this.blogTestManager.createBlog(blogBody);
      blogId = createdBlog.id;
    }

    const postsPromises = [] as Promise<PostsViewDto>[];
    for (let i = 0; i < count; ++i) {
      await delay(50);
      const response = this.createPost(
        {
          title: `Post ${i + 1}`,
          shortDescription: 'Short description',
          content: 'Content',
          blogId,
        },
        HttpStatus.CREATED,
        token,
      );
      postsPromises.push(response);
    }

    return Promise.all(postsPromises);
  }

  async deletePost(postId: string, token?: string): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token || this.getAccessToken()}`)
      .expect(HttpStatus.NO_CONTENT);
  }

  async updatePost(
    postId: string,
    updateBody: UpdatePostDto,
    token?: string,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token || this.getAccessToken()}`)
      .send(updateBody)
      .expect(HttpStatus.NO_CONTENT);
  }
}
