import { Injectable, Logger } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments-repository';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { CommentInputDto } from '../dto/comment-input-dto';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsViewDto } from '../dto/comment-output-type';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { LikeStatusEnum, LikeStatusType } from '../../posts/likes/like-model';
import {
  CommentLikeDocument,
  CommentLikeModel,
} from '../likes/likes-model-for-comments';
import { Model } from 'mongoose';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    private readonly commentsRepository: CommentsRepository,
    @InjectModel(Comment.name) private commentModel: CommentModelType,
    @InjectModel(CommentLikeModel.name)
    private commentLikeDocumentModel: Model<CommentLikeDocument>,
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
    const myStatus: LikeStatusType = 'None';
    return CommentsViewDto.mapToView(comment, myStatus);
  }

  async updateComment(
    commentId: string,
    content: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const comment = await this.commentModel.findOne({
        _id: commentId,
        'commentatorInfo.userId': userId,
      });

      if (!comment) {
        throw NotFoundDomainException.create(
          'Comment not found or you do not have permission to edit it',
          'comment',
        );
      }

      comment.content = content;
      await comment.save();
      return true;
    } catch (error) {
      this.logger.error(`Error updating comment: ${error.message}`);
      throw error;
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const comment = await this.commentModel.findOne({
        _id: commentId,
        'commentatorInfo.userId': userId,
      });

      if (!comment) {
        throw NotFoundDomainException.create(
          'Comment not found or you do not have permission to delete it',
          'comment',
        );
      }

      await comment.deleteOne();
      return true;
    } catch (error) {
      this.logger.error(`Error deleting comment: ${error.message}`);
      throw error;
    }
  }

  async commentExists(commentId: string): Promise<boolean> {
    const comment = await this.commentModel.findById(commentId).exec();
    return !!comment;
  }

  async updateLikeComment(
    commentId: string,
    userId: string,
    likeStatus: LikeStatusType,
  ): Promise<void> {
    const existingLike = await this.commentLikeDocumentModel.findOne({
      commentId,
      userId,
    });

    if (likeStatus === LikeStatusEnum.NONE) {
      if (existingLike) {
        await existingLike.deleteOne();
      }
    } else {
      if (existingLike) {
        if (existingLike.status !== likeStatus) {
          existingLike.status = likeStatus as LikeStatusEnum;
          await existingLike.save();
        }
      } else {
        const newLike = new this.commentLikeDocumentModel({
          commentId,
          userId,
          status: likeStatus as LikeStatusEnum,
        });
        await newLike.save();
      }
    }

    await this.updateCommentLikeCounts(commentId);
  }

  private async updateCommentLikeCounts(commentId: string): Promise<void> {
    const likesCount = await this.commentLikeDocumentModel.countDocuments({
      commentId,
      status: LikeStatusEnum.LIKE,
    });
    const dislikesCount = await this.commentLikeDocumentModel.countDocuments({
      commentId,
      status: LikeStatusEnum.DISLIKE,
    });

    await this.commentModel.findByIdAndUpdate(commentId, {
      'likesInfo.likesCount': likesCount,
      'likesInfo.dislikesCount': dislikesCount,
    });
  }
}
