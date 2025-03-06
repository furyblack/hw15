import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post';
import {
  CreatePostForBlogInputDto,
  CreatePostDto,
  UpdatePostForMethod,
} from '../dto/create-post.dto';
import { PostsRepository } from '../infrastructure/posts-repository';
import { DeletionStatus } from '../../../user-accounts/domain/user.entity';
import { Blog, BlogModelType } from '../../blogs/domain/blog.entity';
import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';
import { LikeStatusType } from '../likes/like-model';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    private postRepository: PostsRepository,
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogModel.findOne({
      _id: dto.blogId,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!blog) {
      throw BadRequestDomainException.create('blog not found', 'blogId');
    }

    const post = this.postModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });
    await this.postRepository.save(post);
    return post._id.toString();
  }

  async createPostForBlog(
    blogId: string,
    dto: CreatePostForBlogInputDto,
  ): Promise<string> {
    const blogExists = await this.blogModel.exists({
      _id: blogId,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!blogExists) {
      throw BadRequestDomainException.create('blog not found', 'blogId');
    }
    const blog = await this.blogModel.findOne({
      _id: blogId,
    });
    const post = this.postModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog!.name,
    });
    await this.postRepository.save(post);
    return post._id.toString();
  }

  async findById(postId: string): Promise<Post | null> {
    return this.postModel.findById(postId).exec();
  }

  async deletePost(id: string) {
    const post = await this.postRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postRepository.save(post);
  }
  async updatePost(id: string, dto: UpdatePostForMethod): Promise<string> {
    const post = await this.postRepository.findOrNotFoundFail(id);
    post.update(dto);
    await this.postRepository.save(post);
    return post._id.toString();
  }
  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatusType,
    userLogin: string,
  ): Promise<void> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('post not found');
    }

    // логика обновления лайков
    const existingLikeIndex = post.newestLikes.findIndex(
      (like) => like.userId === userId,
    );
    console.log('aaa', post.newestLikes);
    // удаляем текущий статус пользователя
    if (existingLikeIndex !== -1) {
      const existingLike = post.newestLikes[existingLikeIndex];
      if (existingLike) {
        if (post.likesCount > 0) {
          post.likesCount -= 1;
        }
      }
      post.newestLikes.splice(existingLikeIndex, 1);
    }
    console.log('bbb', post.newestLikes);
    // добавляем новый статус
    if (likeStatus === 'Like') {
      post.newestLikes.push({
        userId,
        login: userLogin,
        addedAt: new Date().toISOString(),
      });
      console.log('ccc', post.newestLikes);
      //ограничиваем массив тремя элементами
      if (post.newestLikes.length > 3) {
        post.newestLikes.shift(); // Удаляем самый старый лайк
      }

      post.likesCount += 1;
    } else if (likeStatus === 'Dislike') {
      post.dislikesCount += 1;
    }

    //если статус "None", просто удаляем лайк/дизлайк
    if (likeStatus === 'None' && existingLikeIndex !== -1) {
      if (post.dislikesCount > 0) {
        post.dislikesCount -= 1;
      }
    }
    console.log('ddd', post.newestLikes);
    //сохраняем изменения в базе данных
    await post.save();
    console.log('ggg', post.newestLikes);
  }
}
