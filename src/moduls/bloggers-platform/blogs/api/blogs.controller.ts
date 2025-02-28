import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';

import { BlogsViewDto } from './view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { BlogsService } from '../application/blogs.service';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CreateBlogDomainDto } from '../dto/create-user.domain.dto';
import { CreatePostDomainDto } from '../../posts/dto/create-post.dto';
import { PostsViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogQueryRepository: BlogsQueryRepository,
    private blogService: BlogsService,
    private postService: PostsService,
    private postQueryRepository: PostsQueryRepository,
  ) {}
  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    return this.blogQueryRepository.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogsViewDto> {
    return this.blogQueryRepository.getByIdOrNotFoundFail(id);
  }
  @Get(':id/posts')
  async getPostsForBlog(
    @Param('id') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.postQueryRepository.getAllPostsForBlog(blogId, query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('BasicAuth')
  async createBlog(@Body() body: CreateBlogDomainDto): Promise<BlogsViewDto> {
    const blogId = await this.blogService.createBlog(body);
    return this.blogQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('BasicAuth')
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() body: CreatePostDomainDto,
  ): Promise<PostsViewDto> {
    const postId = await this.postService.createPostForBlog(blogId, body);
    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('BasicAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.blogService.deleteBlog(id);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('BasicAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<BlogsViewDto> {
    const blogId = await this.blogService.updateBlog(id, body);
    return this.blogQueryRepository.getByIdOrNotFoundFail(blogId);
  }
}
