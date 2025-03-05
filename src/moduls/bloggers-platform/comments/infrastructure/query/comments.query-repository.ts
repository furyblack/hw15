import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { GetCommentsQueryParams } from '../../dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentsViewDto } from '../../dto/comment-output-type';
import { DeletionStatus } from '../../../../user-accounts/domain/user.entity';
import { FilterQuery } from 'mongoose';
import { Post, PostModelType } from '../../../posts/domain/post';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    @InjectModel(Comment.name)
    private commentModel: CommentModelType,
  ) {}
  async getCommentsForPost(
    postId: string,
    query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    const postExists = await this.postModel.exists({
      _id: postId,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!postExists) {
      throw new NotFoundException('Post not found');
    }

    const filter: FilterQuery<Comment> = {
      deletionStatus: DeletionStatus.NotDeleted,
      postId: postId,
    };

    if (query.searchTitleTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        title: { $regex: query.searchTitleTerm, $options: 'i' },
      });
    }

    const comments = await this.commentModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.commentModel.countDocuments(filter);

    const items = comments.map((c) => CommentsViewDto.mapToView(c));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getCommentById(id: string): Promise<CommentsViewDto> {
    const comment = await this.commentModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!comment) {
      throw NotFoundDomainException.create('Comment not found', 'comment');
    }
    return CommentsViewDto.mapToView(comment);
  }
}
