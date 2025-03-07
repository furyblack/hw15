import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments-repository';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { CommentInputDto } from '../dto/comment-input-dto';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsViewDto } from '../dto/comment-output-type';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    @InjectModel(Comment.name) private commentModel: CommentModelType,
  ) {}

  async createComment(
    postId: string,
    userId: string,
    userLogin: string,
    dto: CommentInputDto,
  ): Promise<CommentsViewDto> {
    const comment = this.commentModel.createInstance(
      dto.content,
      postId,
      userId,
      userLogin,
    );
    await this.commentsRepository.save(comment);
    return CommentsViewDto.mapToView(comment);
  }
  async updateComment(
    commentId: string,
    content: string,
    userId: string,
  ): Promise<boolean> {
    const comment = await this.commentModel.findOne({
      _id: commentId,
      userId, // Проверяем, что комментарий принадлежит пользователю
    });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found or you do not have permission to edit it',
      );
    }

    comment.content = content;
    await comment.save();
    return true;
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.commentModel.findOne({
      _id: commentId,
      userId, // Проверяем, что комментарий принадлежит пользователю
    });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found or you do not have permission to delete it',
      );
    }

    await comment.deleteOne();
    return true;
  }
}
