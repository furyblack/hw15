import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogDomainDto } from '../../src/moduls/bloggers-platform/blogs/dto/create-user.domain.dto';
import { BlogsViewDto } from '../../src/moduls/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import request from 'supertest';

export class BlogsTestManager {
  constructor(private app: INestApplication) {}

  private readonly BASIC_CREDENTIALS = {
    username: 'admin',
    password: 'qwerty',
  };

  async createBlog(
    data: CreateBlogDomainDto,
    expectStatus: number = HttpStatus.CREATED,
  ): Promise<BlogsViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/api/blogs')
      .auth(this.BASIC_CREDENTIALS.username, this.BASIC_CREDENTIALS.password, {
        type: 'basic',
      })
      .send(data)
      .expect(expectStatus);

    return response.body;
  }

  async createBlogUnauthorized(data: CreateBlogDomainDto) {
    return request(this.getHttpServer()).post('/api/blogs').send(data);
  }

  async createBlogWithInvalidAuth(data: CreateBlogDomainDto) {
    return request(this.getHttpServer())
      .post('/api/blogs')
      .auth('wrong', 'credentials', { type: 'basic' })
      .send(data);
  }

  private getHttpServer() {
    return this.app.getHttpServer();
  }
}
