import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreatePostInputDto, UpdatePostDto } from '../dto/create-post.dto';
import { PostsViewDto } from './view-dto/posts.view-dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';

@Controller('posts')
export class PostsController {
  constructor(
    private postQueryRepository: PostsQueryRepository,
    private postService: PostsService,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('BasicAuth')
  async createPost(@Body() body: CreatePostInputDto): Promise<PostsViewDto> {
    const postId = await this.postService.createPost(body);
    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }

  // @Post(':id/comments')
  // @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JwtAuthGuard)
  // async createComment(
  //   // userId: string,
  //   // postId: string,
  //   @Body() body: CommentInputDto,
  // ): Promise<OutputCommentType> {
  //   const content = body.content;
  //   return this.postQueryRepository.getByIdOrNotFoundFail(content);
  // }

  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.postQueryRepository.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<PostsViewDto> {
    return this.postQueryRepository.getByIdOrNotFoundFail(id);
  }
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('BasicAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.postService.deletePost(id);
  }
  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('BasicAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body()
    body: UpdatePostDto,
  ): Promise<PostsViewDto> {
    console.log('123123123123');
    const postId = await this.postService.updatePost(id, body);
    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
