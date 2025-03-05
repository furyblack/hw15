import { Injectable } from '@nestjs/common';
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
}
