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

  async createPost(
    createModel: CreatePostDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostsViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/api/posts')
      .send(createModel)
      .expect(statusCode);
    return response.body;
  }
  async createSeveralPosts(
    count: number,
    blogId?: string,
  ): Promise<PostsViewDto[]> {
    // Если blogId не передан, создаем новый блог
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
      const response = this.createPost({
        title: `Post ${i + 1}`,
        shortDescription: 'Short description',
        content: 'Content',
        blogId,
      });
      postsPromises.push(response);
    }

    // Ждем, пока все посты будут созданы
    return Promise.all(postsPromises);
  }
  async deletePost(postId: string): Promise<void> {
    const server = this.app.getHttpServer();
    await request(server).delete(`/api/posts/${postId}`).expect(204);
  }
  async updatePost(postId: string, updateBody: UpdatePostDto): Promise<void> {
    await request(this.app.getHttpServer())
      .put(`/api/posts/${postId}`)
      .send(updateBody)
      .expect(HttpStatus.NO_CONTENT);
  }
}
